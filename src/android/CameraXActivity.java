package org.apache.cordova.camera;

import android.Manifest;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.provider.MediaStore;
import android.util.Log;
import android.view.MotionEvent;
import android.view.ScaleGestureDetector;
import android.view.View;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.Toast;


import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.camera.core.AspectRatio;
import androidx.camera.core.Camera;
import androidx.camera.core.CameraControl;
import androidx.camera.core.CameraInfo;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.camera.core.Preview;
import androidx.camera.core.ZoomState;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.LifecycleOwner;

import com.google.common.util.concurrent.ListenableFuture;

import java.io.File;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class CameraXActivity extends AppCompatActivity implements View.OnClickListener {
    private static final String TAG = "CameraXActivity";
    private static final int REQUEST_CODE_PERMISSIONS = 10;
    private static final String[] REQUIRED_PERMISSIONS = {
            Manifest.permission.CAMERA,
    };

    private PreviewView previewView;
    private ImageButton captureButton;
    private ImageButton cameraFlipButton;
    private ImageButton flashButton;
    private LinearLayout flashModesBar;
    private ImageButton flashAutoButton;
    private ImageButton flashOnButton;
    private ImageButton flashOffButton;
    private TextView zoomLevelText;
    private SeekBar zoomSeekBar;
    private Handler handler = new Handler();
    private Runnable hideZoomLevelRunnable;
    private Runnable hideZoomControlsRunnable;
    private boolean isUserControllingZoom = false;
    
    private ScaleGestureDetector scaleGestureDetector;
    private Camera camera;
    private float currentZoomRatio = 1.0f;
    private float maxZoomRatio = 8.0f;
    private float minZoomRatio = 0.5f;
    
    private ImageCapture imageCapture;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    
    // Camera state
    private int cameraFacing = CameraSelector.LENS_FACING_BACK;
    private int flashMode = ImageCapture.FLASH_MODE_AUTO;
    private boolean flashModeBarVisible = false;
    
    // Options passed from Cordova
    private int quality = 50;
    private int targetWidth = 0;
    private int targetHeight = 0;
    private boolean saveToPhotoAlbum = false;
    private boolean correctOrientation = true;
    private boolean allowEdit = false;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(getResources().getIdentifier("camerax_activity", "layout", getPackageName()));
        
        // Initialize UI components
        previewView = findViewById(getResources().getIdentifier("preview_view", "id", getPackageName()));
        captureButton = findViewById(getResources().getIdentifier("capture_button", "id", getPackageName()));
        cameraFlipButton = findViewById(getResources().getIdentifier("camera_flip_button", "id", getPackageName()));
        flashButton = findViewById(getResources().getIdentifier("flash_button", "id", getPackageName()));
        flashModesBar = findViewById(getResources().getIdentifier("flash_modes_bar", "id", getPackageName()));
        flashAutoButton = findViewById(getResources().getIdentifier("flash_auto_button", "id", getPackageName()));
        flashOnButton = findViewById(getResources().getIdentifier("flash_on_button", "id", getPackageName()));
        flashOffButton = findViewById(getResources().getIdentifier("flash_off_button", "id", getPackageName()));
        zoomLevelText = findViewById(getResources().getIdentifier("zoom_level_text", "id", getPackageName()));
        zoomSeekBar = findViewById(getResources().getIdentifier("zoom_seekbar", "id", getPackageName()));

        zoomSeekBar.setMax(100);
        zoomSeekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                if (fromUser && camera != null) {
                    isUserControllingZoom = true;
                    
                    // Convert progress (0-100) to linear zoom (0.0-1.0)
                    float linearZoom = progress / 100f;
                    
                    // Set the zoom ratio
                    CameraControl cameraControl = camera.getCameraControl();
                    cameraControl.setLinearZoom(linearZoom);
                    
                    // Convert linear zoom to ratio for display
                    float zoomRatio = calculateZoomRatioFromLinear(linearZoom);
                    updateZoomLevelDisplay(zoomRatio);
                }
            }

        @Override
            public void onStartTrackingTouch(SeekBar seekBar) {
                isUserControllingZoom = true;
                // Cancel auto-hide when user starts interacting
                handler.removeCallbacks(hideZoomControlsRunnable);
                handler.removeCallbacks(hideZoomLevelRunnable);
            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {
                // Schedule auto-hide after user stops interacting
                handler.postDelayed(hideZoomControlsRunnable, 2000);
            }
        });

        hideZoomLevelRunnable = () -> {
            zoomLevelText.setVisibility(View.GONE);
            if (!isUserControllingZoom) {
                zoomSeekBar.setVisibility(View.GONE);
            }
        };
        
        hideZoomControlsRunnable = () -> {
            zoomLevelText.setVisibility(View.GONE);
            zoomSeekBar.setVisibility(View.GONE);
            isUserControllingZoom = false;
        };

        
        // Set click listeners
        captureButton.setOnClickListener(this);
        cameraFlipButton.setOnClickListener(this);
        flashButton.setOnClickListener(this);
        flashAutoButton.setOnClickListener(this);
        flashOnButton.setOnClickListener(this);
        flashOffButton.setOnClickListener(this);
        
        // Extract parameters from intent
        Intent intent = getIntent();
        quality = intent.getIntExtra("quality", 50);
        targetWidth = intent.getIntExtra("targetWidth", 0);
        targetHeight = intent.getIntExtra("targetHeight", 0);
        saveToPhotoAlbum = intent.getBooleanExtra("saveToPhotoAlbum", false);
        correctOrientation = intent.getBooleanExtra("correctOrientation", true);
        allowEdit = intent.getBooleanExtra("allowEdit", false);
        
        // Set initial flash mode based on intent or default to AUTO
        flashMode = intent.getIntExtra("flashMode", ImageCapture.FLASH_MODE_AUTO);
        setFlashButtonIcon(flashMode);

        previewView.setScaleType(PreviewView.ScaleType.FIT_CENTER);

        //set up pinch for zoom
        scaleGestureDetector = new ScaleGestureDetector(this, new ScaleGestureDetector.SimpleOnScaleGestureListener() {
            @Override
            public boolean onScale(ScaleGestureDetector detector) {
                if (camera == null){
                    return false;
                }

                CameraControl cameraControl = camera.getCameraControl();
                CameraInfo cameraInfo = camera.getCameraInfo();

                ZoomState zoomState = cameraInfo.getZoomState().getValue();
                float currentZoomRatio = zoomState.getZoomRatio();
                maxZoomRatio = zoomState.getMaxZoomRatio();
                
                // Convert current zoom ratio to linear value (0.0-1.0)
                float currentLinearZoom = calculateLinearFromZoomRatio(currentZoomRatio);
                
                // Apply scale factor to linear zoom
                float scaleFactor = detector.getScaleFactor();
                float newLinearZoom = currentLinearZoom * scaleFactor;
                
                // Clamp to 0.0-1.0 range
                newLinearZoom = Math.max(0.0f, Math.min(1.0f, newLinearZoom));
                
                // Update the seekbar position without triggering listener
                int seekBarProgress = (int)(newLinearZoom * 100);
                zoomSeekBar.setProgress(seekBarProgress);
                
                // Convert back to ratio for display
                float newZoomRatio = calculateZoomRatioFromLinear(newLinearZoom);
                
                // Show zoom controls
                updateZoomLevelDisplay(newZoomRatio);
                zoomSeekBar.setVisibility(View.VISIBLE);
                
                // Set linear zoom
                cameraControl.setLinearZoom(newLinearZoom);
                return true;
            }
            
            @Override
            public boolean onScaleBegin(ScaleGestureDetector detector) {
                // Show zoom controls
                zoomLevelText.setVisibility(View.VISIBLE);
                zoomSeekBar.setVisibility(View.VISIBLE);
                
                // Remove any pending hide callbacks
                handler.removeCallbacks(hideZoomLevelRunnable);
                handler.removeCallbacks(hideZoomControlsRunnable);
                return true;
            }
            
            @Override
            public void onScaleEnd(ScaleGestureDetector detector) {
                // Hide zoom controls after a delay
                handler.postDelayed(hideZoomControlsRunnable, 2000);
            }
        });

        //add pinch to preview view
        previewView.setOnTouchListener((view,event) -> {
            scaleGestureDetector.onTouchEvent(event);
            return true;
        });
        
        // Check and request permissions
        if (allPermissionsGranted()) {
            startCamera();
        } else {
            ActivityCompat.requestPermissions(this, REQUIRED_PERMISSIONS, REQUEST_CODE_PERMISSIONS);
        }
    }

    // Convert linear zoom (0.0-1.0) to zoom ratio (minZoom to maxZoom)
    private float calculateZoomRatioFromLinear(float linearZoom) {
        return minZoomRatio + (linearZoom * (maxZoomRatio - minZoomRatio));
    }

    // Convert zoom ratio to linear zoom
    private float calculateLinearFromZoomRatio(float zoomRatio) {
        return (zoomRatio - minZoomRatio) / (maxZoomRatio - minZoomRatio);
    }

    private void updateZoomLevelDisplay(float zoomRatio) {
        String formattedZoom = String.format(Locale.US, "%.1fx", zoomRatio);
        zoomLevelText.setText(formattedZoom);
        zoomLevelText.setVisibility(View.VISIBLE);

        handler.removeCallbacks(hideZoomLevelRunnable);
        handler.removeCallbacks(hideZoomControlsRunnable);
        handler.postDelayed(hideZoomControlsRunnable, 2000);
    }
    @Override
    public void onClick(View view) {
        int id = view.getId();
        if (id == getResources().getIdentifier("capture_button", "id", getPackageName())) {
            takePhoto();
        } else if (id == getResources().getIdentifier("camera_flip_button", "id", getPackageName()))  {
            flipCamera();
        } else if (id == getResources().getIdentifier("flash_button", "id", getPackageName())) {
            toggleFlashModeBar();
        } else if (id == getResources().getIdentifier("flash_auto_button", "id", getPackageName()))  {
            setFlashMode(ImageCapture.FLASH_MODE_AUTO);
            toggleFlashModeBar();
        } else if (id == getResources().getIdentifier("flash_on_button", "id", getPackageName()))  {
            setFlashMode(ImageCapture.FLASH_MODE_ON);
            toggleFlashModeBar();
        } else if (id == getResources().getIdentifier("flash_off_button", "id", getPackageName()))  {
            setFlashMode(ImageCapture.FLASH_MODE_OFF);
            toggleFlashModeBar();
        }
    }
    
    private void toggleFlashModeBar() {
        flashModeBarVisible = !flashModeBarVisible;
        flashModesBar.setVisibility(flashModeBarVisible ? View.VISIBLE : View.GONE);
    }
    
    private void flipCamera() {
        cameraFacing = (cameraFacing == CameraSelector.LENS_FACING_BACK) ? 
                CameraSelector.LENS_FACING_FRONT : CameraSelector.LENS_FACING_BACK;
        startCamera(); // Restart camera with new facing
    }
    
    private void setFlashMode(int mode) {
        flashMode = mode;
        setFlashButtonIcon(flashMode);
        
        // Update the imageCapture configuration with the new flash mode
        if (imageCapture != null) {
            imageCapture.setFlashMode(flashMode);
        }
    }
    
    private void setFlashButtonIcon(int mode) {
        // Update the button icon
        switch (mode) {
            case ImageCapture.FLASH_MODE_AUTO:
                flashButton.setBackground(getDrawable(getResources().getIdentifier("ic_flash_auto", "drawable", getPackageName())));
                break;
            case ImageCapture.FLASH_MODE_ON:
                flashButton.setBackground(getDrawable(getResources().getIdentifier("ic_flash_on", "drawable", getPackageName())));
                break;
            case ImageCapture.FLASH_MODE_OFF:
                flashButton.setBackground(getDrawable(getResources().getIdentifier("ic_flash_off", "drawable", getPackageName())));
                break;
        }
    }
    
    private void startCamera() {
        ListenableFuture<ProcessCameraProvider> cameraProviderFuture = 
                ProcessCameraProvider.getInstance(this);
        
        cameraProviderFuture.addListener(() -> {
            try {
                // Camera provider is now guaranteed to be available
                ProcessCameraProvider cameraProvider = cameraProviderFuture.get();

                int aspectRatio = AspectRatio.RATIO_4_3;
                // Set up the preview use case
                Preview preview = new Preview.Builder()
                    .setTargetAspectRatio(aspectRatio)
                    .build();
                preview.setSurfaceProvider(previewView.getSurfaceProvider());
                
                // Set up the capture use case
                imageCapture = new ImageCapture.Builder()
                        .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                        .setTargetAspectRatio(aspectRatio)
                        .setTargetRotation(previewView.getDisplay().getRotation())
                        .setFlashMode(flashMode)
                        .build();
                
                // Select front or back camera based on current facing mode
                CameraSelector cameraSelector = new CameraSelector.Builder()
                        .requireLensFacing(cameraFacing)
                        .build();
                
                // Unbind any bound use cases before rebinding
                cameraProvider.unbindAll();
                
                // Bind use cases to camera
                camera = cameraProvider.bindToLifecycle(
                        ((LifecycleOwner) this),
                        cameraSelector,
                        preview,
                        imageCapture);
                
                 // Reset zoom level indicator after camera switch
                if (camera != null) {
                    camera.getCameraInfo().getZoomState().observe(this, zoomState -> {
                        // Initialize zoom display with current zoom ratio
                        if (zoomState != null && zoomState.getZoomRatio() != 1.0f) {
                            updateZoomLevelDisplay(zoomState.getZoomRatio());
                        }
                    });
                }
                
            } catch (ExecutionException | InterruptedException e) {
                Log.e(TAG, "Error starting camera: " + e.getMessage());
            }
        }, ContextCompat.getMainExecutor(this));
    }
    
    private void takePhoto() {
    if (imageCapture == null) {
        Log.e(TAG, "imageCapture is null");
        return;
    }
    
    // Get the URI passed from CameraLauncher
    Uri outputUri = getIntent().getParcelableExtra(MediaStore.EXTRA_OUTPUT);
    
    if (outputUri == null) {
        Log.e(TAG, "No output URI provided");
        setResult(Activity.RESULT_CANCELED);
        finish();
        return;
    }
    
    try {
        OutputStream outputStream = getContentResolver().openOutputStream(outputUri);
        if (outputStream == null) {
            Log.e(TAG, "Failed to open output stream for URI: " + outputUri);
            setResult(Activity.RESULT_CANCELED);
            finish();
            return;
        }
        
        // Create output options with the output stream
        ImageCapture.OutputFileOptions outputOptions = new ImageCapture.OutputFileOptions.Builder(outputStream).build();
    
            // Take the picture
            imageCapture.takePicture(
                outputOptions,
                executor,
                new ImageCapture.OnImageSavedCallback() {
                    @Override
                    public void onImageSaved(@NonNull ImageCapture.OutputFileResults outputFileResults) {
                        // Just return success - the image has been saved to the URI that Cordova expects
                        setResult(Activity.RESULT_OK);
                        finish();
                    }
                
                    @Override
                    public void onError(@NonNull ImageCaptureException exception) {
                        Log.e(TAG, "Photo capture failed: " + exception.getMessage());
                        Intent resultIntent = new Intent();
                        resultIntent.putExtra("error", exception.getMessage());
                        setResult(Activity.RESULT_CANCELED, resultIntent);
                        finish();
                    }
                }
        );
    } catch (Exception e) {
        Log.e(TAG, "Error setting up image capture: " + e.getMessage());
        setResult(Activity.RESULT_CANCELED);
        finish();
    }
}

    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == 1 && resultCode == Activity.RESULT_OK && data != null) {
            // Get edited image result and return it
            String editedImageUri = data.getStringExtra("editedImageUri");
            Intent resultIntent = new Intent();
            resultIntent.putExtra("imageUri", editedImageUri);
            setResult(Activity.RESULT_OK, resultIntent);
            finish();
        } else if (resultCode == Activity.RESULT_CANCELED) {
            setResult(Activity.RESULT_CANCELED);
            finish();
        }
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, 
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == REQUEST_CODE_PERMISSIONS) {
            if (allPermissionsGranted()) {
                startCamera();
            } else {
                Toast.makeText(this, "Permissions not granted.", Toast.LENGTH_SHORT).show();
                setResult(Activity.RESULT_CANCELED);
                finish();
            }
        }
    }
    
    private boolean allPermissionsGranted() {
        for (String permission : REQUIRED_PERMISSIONS) {
            boolean granted = ContextCompat.checkSelfPermission(this, permission) 
                == PackageManager.PERMISSION_GRANTED;
            Log.d(TAG, "Permission " + permission + " granted: " + granted);
            if (!granted) {
                return false;
            }
    }
    return true;
}
    @Override
    protected void onPause() {
        super.onPause();
    }
    
    @Override
    public void onBackPressed() {
        setResult(Activity.RESULT_CANCELED);
        super.onBackPressed();
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        
        if (!executor.isShutdown()) {
            executor.shutdown();
        }

        handler.removeCallbacks(hideZoomLevelRunnable);
        System.gc();
    }
}
