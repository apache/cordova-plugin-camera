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
import android.provider.MediaStore;
import android.util.Log;
import android.view.View;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.LifecycleOwner;

import com.google.common.util.concurrent.ListenableFuture;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;
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
    
    private ImageCapture imageCapture;
    private final Executor executor = Executors.newSingleThreadExecutor();
    
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
        
        // Check and request permissions
        if (allPermissionsGranted()) {
            startCamera();
        } else {
            ActivityCompat.requestPermissions(this, REQUIRED_PERMISSIONS, REQUEST_CODE_PERMISSIONS);
        }
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
                
                // Set up the preview use case
                Preview preview = new Preview.Builder().build();
                preview.setSurfaceProvider(previewView.getSurfaceProvider());
                
                // Set up the capture use case
                imageCapture = new ImageCapture.Builder()
                        .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
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
                cameraProvider.bindToLifecycle(
                        ((LifecycleOwner) this),
                        cameraSelector,
                        preview,
                        imageCapture);
                
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
        
        // Create output file
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(System.currentTimeMillis());
        String imageFileName = "JPEG_" + timeStamp + "_";
        
        ContentValues contentValues = new ContentValues();
        contentValues.put(MediaStore.MediaColumns.DISPLAY_NAME, imageFileName);
        contentValues.put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg");
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            contentValues.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_PICTURES);
        }
        
        // Create output options object
        ImageCapture.OutputFileOptions outputOptions;
        
        if (saveToPhotoAlbum) {
            // Save to media store
            outputOptions = new ImageCapture.OutputFileOptions.Builder(
                    getContentResolver(),
                    MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                    contentValues).build();
        } else {
            // Save to a temp file
            File photoFile = new File(getCacheDir(), imageFileName + ".jpg");
            outputOptions = new ImageCapture.OutputFileOptions.Builder(photoFile).build();
        }
        
        // Set JPEG quality (0-100)
        //if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
         //   contentValues.put(MediaStore.Images.Media.QUALITY, quality);
        //}
        
        // Take the picture
        imageCapture.takePicture(
                outputOptions,
                executor,
                new ImageCapture.OnImageSavedCallback() {
                    @Override
                    public void onImageSaved(@NonNull ImageCapture.OutputFileResults outputFileResults) {
                        Uri savedUri = outputFileResults.getSavedUri();
                        String imagePath;
                        
                        if (savedUri == null) {
                            // When saved to cache, we need to create a content URI
                            File photoFile = new File(getCacheDir(), imageFileName + ".jpg");
                            savedUri = Uri.fromFile(photoFile);
                        }
                        
                        imagePath = savedUri.toString();
                        
                        if (allowEdit) {
                            // If you have an edit activity, start it here
                            /*
                            Intent editIntent = new Intent(CameraXActivity.this, 
                                    ImageEditActivity.class);
                            editIntent.putExtra("imageUri", imagePath);
                            startActivityForResult(editIntent, 1);
                            */
                            
                            // Since editing is not implemented yet, just return the result
                            Intent resultIntent = new Intent();
                            resultIntent.putExtra("imageUri", imagePath);
                            setResult(Activity.RESULT_OK, resultIntent);
                            finish();
                        } else {
                            // Return the result directly
                            Intent resultIntent = new Intent();
                            resultIntent.putExtra("imageUri", imagePath);
                            setResult(Activity.RESULT_OK, resultIntent);
                            finish();
                        }
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
}
