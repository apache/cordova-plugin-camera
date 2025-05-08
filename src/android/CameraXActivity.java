package org.apache.cordova.camera;

import android.Manifest;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.hardware.camera2.CameraCharacteristics;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.provider.MediaStore;
import android.util.Log;
import android.util.Rational;
import android.util.Size;
import android.view.OrientationEventListener;
import android.view.MotionEvent;
import android.view.ScaleGestureDetector;
import android.view.Surface;
import android.view.View;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.Toast;


import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.camera.camera2.interop.Camera2CameraInfo;
import androidx.camera.camera2.interop.ExperimentalCamera2Interop;
import androidx.camera.core.Camera;
import androidx.camera.core.CameraControl;
import androidx.camera.core.CameraInfo;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.camera.core.Preview;
import androidx.camera.core.ViewPort;
import androidx.camera.core.UseCaseGroup;
import androidx.camera.core.ZoomState;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.core.resolutionselector.AspectRatioStrategy;
import androidx.camera.core.resolutionselector.ResolutionSelector;
import androidx.camera.core.resolutionselector.ResolutionStrategy;
import androidx.camera.view.PreviewView;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.LifecycleOwner;
import androidx.transition.ChangeBounds;
import androidx.transition.Transition;
import androidx.transition.TransitionManager;

import com.google.common.util.concurrent.ListenableFuture;

import java.io.File;
import java.io.OutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.apache.cordova.camera.ExifHelper;

@ExperimentalCamera2Interop
public class CameraXActivity extends AppCompatActivity implements View.OnClickListener {
    private static final String TAG = "CameraXActivity";
    private static final int REQUEST_CODE_PERMISSIONS = 10;
    private static final String[] REQUIRED_PERMISSIONS = {
            Manifest.permission.CAMERA,
    };
    private static final int JPEG = 0;
    private static final int PNG = 1;

    private PreviewView previewView;
    private ImageButton captureButton;
    private ImageButton cameraFlipButton;
    private ImageButton flashButton;
    private LinearLayout flashModesBar;
    private LinearLayout zoomButtonsContainer;
    private ImageButton flashAutoButton;
    private ImageButton flashOnButton;
    private ImageButton flashOffButton;
    private OrientationEventListener orientationListener;
    private SeekBar zoomSeekBar;
    private TextView zoomLevelText;
    private TextView wideAngleButton;
    private TextView normalZoomButton;
    
    private Handler handler = new Handler();
    private Runnable hideZoomLevelRunnable;
    private Runnable hideZoomControlsRunnable;
    
    private boolean isUserControllingZoom = false;
    private boolean hasUltraWideCamera = false;
    private boolean usingUltraWideCamera = false;
    
    private ScaleGestureDetector scaleGestureDetector;
    private Camera camera;
    private float currentZoomRatio = 1.0f;
    private float maxZoomRatio = 8.0f;
    private float minZoomRatio = 0.5f;
    private int currentOrientation = 0;
    
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
    private int encodingType = 0;
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
        wideAngleButton = findViewById(getResources().getIdentifier("wide_angle_button", "id", getPackageName()));
        normalZoomButton = findViewById(getResources().getIdentifier("normal_zoom_button", "id", getPackageName()));
        zoomButtonsContainer = findViewById(getResources().getIdentifier("zoom_buttons_container", "id", getPackageName()));

        zoomSeekBar.setMax(100);
        zoomSeekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
        @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                if (fromUser && camera != null) {
                    isUserControllingZoom = true;
                    
                    CameraInfo cameraInfo = camera.getCameraInfo();
                    ZoomState zoomState = cameraInfo.getZoomState().getValue();
                    
                    if (zoomState == null) return;
                    
                    float minZoom = Math.max(0.5f, zoomState.getMinZoomRatio());
                    float maxZoom = zoomState.getMaxZoomRatio();
                    float zoomRange = maxZoom - minZoom;
                    float zoomRatio = minZoom + (progress / 100f) * zoomRange;
                    
                    // Convert linear zoom to ratio for display
                    camera.getCameraControl().setZoomRatio(zoomRatio);
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
        wideAngleButton.setOnClickListener(this);
        normalZoomButton.setOnClickListener(this);
        
        // Extract parameters from intent
        Intent intent = getIntent();
        quality = intent.getIntExtra("quality", 50);
        targetWidth = intent.getIntExtra("targetWidth", 0);
        targetHeight = intent.getIntExtra("targetHeight", 0);
        saveToPhotoAlbum = intent.getBooleanExtra("saveToPhotoAlbum", false);
        correctOrientation = intent.getBooleanExtra("correctOrientation", true);
        allowEdit = intent.getBooleanExtra("allowEdit", false);
        encodingType = intent.getIntExtra("encodingType",0);
        
        // Set initial flash mode based on intent or default to AUTO
        flashMode = intent.getIntExtra("flashMode", ImageCapture.FLASH_MODE_AUTO);
        setFlashButtonIcon(flashMode);

        //set up pinch for zoom
        scaleGestureDetector = new ScaleGestureDetector(this, new ScaleGestureDetector.SimpleOnScaleGestureListener() {
            private float lastZoomRatio = 1.0f;
            
            @Override
            public boolean onScale(ScaleGestureDetector detector) {
                if (camera == null) {
                    return false;
                }
        
                CameraControl cameraControl = camera.getCameraControl();
                CameraInfo cameraInfo = camera.getCameraInfo();
                ZoomState zoomState = cameraInfo.getZoomState().getValue();
                if (zoomState == null) return false;
                
                // Get current actual zoom ratio and limits from camera
                float currentZoomRatio = zoomState.getZoomRatio();
                float minZoom = Math.max(0.5f, zoomState.getMinZoomRatio());
                float maxZoom = zoomState.getMaxZoomRatio();
                
                // Calculate new zoom based on pinch scale factor
                float scaleFactor = detector.getScaleFactor();
                float newZoomRatio = lastZoomRatio * scaleFactor;
                
                // Constrain to actual camera limits
                newZoomRatio = Math.max(minZoom, Math.min(newZoomRatio, maxZoom));
                
                // Save for next frame
                lastZoomRatio = newZoomRatio;
                
                updateZoomLevelDisplay(newZoomRatio);
                
                zoomSeekBar.setVisibility(View.VISIBLE);
                
                // Calculate and set slider position based on the zoom ratio
                float zoomProgress = ((newZoomRatio - minZoom) / (maxZoom - minZoom)) * 100;
                zoomSeekBar.setProgress((int)zoomProgress);
                
                cameraControl.setZoomRatio(newZoomRatio);
                return true;
            }
            
            @Override
            public boolean onScaleBegin(ScaleGestureDetector detector) {
                if (camera != null) {
                    ZoomState zoomState = camera.getCameraInfo().getZoomState().getValue();
                    if (zoomState != null) {
                        // Initialize with current zoom
                        lastZoomRatio = zoomState.getZoomRatio();
                    }
                }
                
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

        //set up orientation listener
        setupOrientationListener();
        
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
        } else if (id == getResources().getIdentifier("wide_angle_button", "id", getPackageName())) {
        switchToWideAngleCamera();
        } else if (id == getResources().getIdentifier("normal_zoom_button", "id", getPackageName())) {
            switchToNormalCamera();
        } 
    }
    // Flash Methods
    private void toggleFlashModeBar() {
        // Don't toggle flash mode bar in ultra-wide mode
        if (usingUltraWideCamera) {
            Toast.makeText(this, "Flash not available in wide-angle mode", Toast.LENGTH_SHORT).show();
            return;
        }
        
        flashModeBarVisible = !flashModeBarVisible;
        flashModesBar.setVisibility(flashModeBarVisible ? View.VISIBLE : View.GONE);
    }
    
   private void flipCamera() {
        cameraFacing = (cameraFacing == CameraSelector.LENS_FACING_BACK) ? 
                CameraSelector.LENS_FACING_FRONT : CameraSelector.LENS_FACING_BACK;
        
        // Reset ultra-wide mode when switching to front camera
        if (cameraFacing == CameraSelector.LENS_FACING_FRONT) {
            usingUltraWideCamera = false;
        }
        
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

    // Orientation Methods
    private void setupOrientationListener() {
    try {
        orientationListener = new OrientationEventListener(this) {
            @Override
            public void onOrientationChanged(int orientation) {
                
            try {
                if (orientation == ORIENTATION_UNKNOWN) {
                    return;
                }
    
                // Convert orientation to nearest 90 degrees
                int rotation;
                if (orientation > 315 || orientation <= 45) {
                    rotation = Surface.ROTATION_0;
                } else if (orientation > 45 && orientation <= 135) {
                    rotation = Surface.ROTATION_90; 
                } else if (orientation > 135 && orientation <= 225) {
                    rotation = Surface.ROTATION_180; 
                } else {
                    rotation = Surface.ROTATION_270;
                }
    
                // Only update when rotation changes significantly
                if (Math.abs(rotation - currentOrientation) >= 90) {
                    currentOrientation = rotation;
                    
                    // Update camera rotation
                    if (imageCapture != null) {
                        imageCapture.setTargetRotation(getCameraRotation());
                    } else {
                        Log.w(TAG, "Cannot update rotation - imageCapture is null");
                }
                }
            } catch (Exception e) {
                    Log.e(TAG, "Error in orientation listener: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        };

    // Start the orientation listener if it can be enabled
    if (orientationListener.canDetectOrientation()) {
        orientationListener.enable();
    } else {
        Log.w(TAG, "Orientation detection not supported on this device");
    }
} catch (Exception e) {
        Log.e(TAG, "Failed to setup orientation listener: " + e.getMessage());
        e.printStackTrace();
    }
    }

    private int getCameraRotation() {
    try {
        // Convert device orientation to camera rotation value
        int displayRotation = getWindowManager().getDefaultDisplay().getRotation();
        
        switch (displayRotation) {
            case Surface.ROTATION_0: // Portrait
                return Surface.ROTATION_0;
            case Surface.ROTATION_90: // Landscape right
                return Surface.ROTATION_90;
            case Surface.ROTATION_180: // Upside down portrait
                return Surface.ROTATION_180;
            case Surface.ROTATION_270: // Landscape left
                return Surface.ROTATION_270;
            default:
                Log.w(TAG, "Unknown display rotation: " + displayRotation + ", defaulting to 0");
                return Surface.ROTATION_0;
        }
} catch (Exception e) {
        Log.e(TAG, "Error getting camera rotation: " + e.getMessage());
        e.printStackTrace();
        return Surface.ROTATION_0;
    }
}

    @Override
public void onConfigurationChanged(Configuration newConfig) {
    super.onConfigurationChanged(newConfig);

    try {

        // Update UI for orientation
        updateUIForOrientation(newConfig.orientation);
        ConstraintLayout rootLayout = findViewById(getResources().getIdentifier("camera_container", "id", getPackageName()));
        TransitionManager.beginDelayedTransition(rootLayout);

        if (camera != null && imageCapture != null) {
            imageCapture.setTargetRotation(getCameraRotation());
        }

        if (zoomSeekBar != null) {
            if (newConfig.orientation == Configuration.ORIENTATION_LANDSCAPE) {
                // Place the seekbar on the right side for landscape
                ConstraintLayout controlsLayout = findViewById(getResources().getIdentifier("bottom_controls", "id", getPackageName()));
                ConstraintSet constraintSet = new ConstraintSet();
                constraintSet.clone(controlsLayout);
                constraintSet.clear(zoomSeekBar.getId());
                constraintSet.connect(zoomSeekBar.getId(), ConstraintSet.START, ConstraintSet.PARENT_ID, ConstraintSet.START);
                constraintSet.connect(zoomSeekBar.getId(), ConstraintSet.END, ConstraintSet.PARENT_ID, ConstraintSet.END);
                constraintSet.connect(zoomSeekBar.getId(), ConstraintSet.BOTTOM, captureButton.getId(), ConstraintSet.TOP);
                constraintSet.applyTo(controlsLayout);
            } else {
                // Place the seekbar at the top of the bottom controls for portrait
                ConstraintLayout controlsLayout = findViewById(getResources().getIdentifier("bottom_controls", "id", getPackageName()));
                ConstraintSet constraintSet = new ConstraintSet();
                constraintSet.clone(controlsLayout);
                constraintSet.clear(zoomSeekBar.getId());
                constraintSet.connect(zoomSeekBar.getId(), ConstraintSet.START, ConstraintSet.PARENT_ID, ConstraintSet.START);
                constraintSet.connect(zoomSeekBar.getId(), ConstraintSet.END, ConstraintSet.PARENT_ID, ConstraintSet.END);
                constraintSet.connect(zoomSeekBar.getId(), ConstraintSet.BOTTOM, zoomButtonsContainer.getId(), ConstraintSet.TOP);
                constraintSet.applyTo(controlsLayout);
            }
        }
        
        } catch (Exception e){
            Log.e(TAG, "Error in onConfigurationChanged: " + e.getMessage());
            e.printStackTrace();
        }
    }

// Add method to update UI for different orientations
    private void updateUIForOrientation(int orientation) {
    try {
        ConstraintLayout controlsLayout = findViewById(getResources().getIdentifier("bottom_controls", "id", getPackageName()));
        ConstraintLayout actionBarLayout = findViewById(getResources().getIdentifier("action_bar_background", "id", getPackageName()));
        ConstraintLayout rootLayout = findViewById(getResources().getIdentifier("camera_container", "id", getPackageName()));
        
        // Get constraints to update
        ConstraintSet constraintSet = new ConstraintSet();
        constraintSet.clone(rootLayout);
        
        if (orientation == Configuration.ORIENTATION_LANDSCAPE) {
            // In landscape, move bottom controls to the right side
            constraintSet.clear(controlsLayout.getId(), ConstraintSet.BOTTOM);
            constraintSet.clear(controlsLayout.getId(), ConstraintSet.START);
            constraintSet.clear(controlsLayout.getId(), ConstraintSet.END);
            constraintSet.connect(controlsLayout.getId(), ConstraintSet.END, ConstraintSet.PARENT_ID, ConstraintSet.END);
            constraintSet.connect(controlsLayout.getId(), ConstraintSet.TOP, ConstraintSet.PARENT_ID, ConstraintSet.TOP);
            constraintSet.connect(controlsLayout.getId(), ConstraintSet.BOTTOM, ConstraintSet.PARENT_ID, ConstraintSet.BOTTOM);
            
            // Set the width and height for landscape
            constraintSet.constrainWidth(controlsLayout.getId(), ConstraintLayout.LayoutParams.WRAP_CONTENT);
            constraintSet.constrainHeight(controlsLayout.getId(), ConstraintLayout.LayoutParams.MATCH_PARENT);
            
            // Update zoom buttons to vertical
            zoomButtonsContainer.setOrientation(LinearLayout.VERTICAL);
            
            // Update flash modes bar layout for landscape
            if (flashModesBar != null) {
                flashModesBar.setOrientation(LinearLayout.VERTICAL);
                ConstraintSet actionBarConstraints = new ConstraintSet();
                actionBarConstraints.clone((ConstraintLayout) flashModesBar.getParent());
                actionBarConstraints.clear(flashModesBar.getId(), ConstraintSet.START);
                actionBarConstraints.clear(flashModesBar.getId(), ConstraintSet.TOP);
                actionBarConstraints.connect(flashModesBar.getId(), ConstraintSet.TOP, flashButton.getId(), ConstraintSet.BOTTOM);
                actionBarConstraints.connect(flashModesBar.getId(), ConstraintSet.START, flashButton.getId(), ConstraintSet.START);
                actionBarConstraints.applyTo((ConstraintLayout) flashModesBar.getParent());
            }
            
            // Move action bar to the left side in landscape
            constraintSet.clear(actionBarLayout.getId(), ConstraintSet.TOP);
            constraintSet.clear(actionBarLayout.getId(), ConstraintSet.START);
            constraintSet.clear(actionBarLayout.getId(), ConstraintSet.END);
            constraintSet.connect(actionBarLayout.getId(), ConstraintSet.START, ConstraintSet.PARENT_ID, ConstraintSet.START);
            constraintSet.connect(actionBarLayout.getId(), ConstraintSet.TOP, ConstraintSet.PARENT_ID, ConstraintSet.TOP);
            constraintSet.connect(actionBarLayout.getId(), ConstraintSet.BOTTOM, ConstraintSet.PARENT_ID, ConstraintSet.BOTTOM);
            
            // Set width and height for action bar in landscape
            constraintSet.constrainWidth(actionBarLayout.getId(), ConstraintLayout.LayoutParams.WRAP_CONTENT);
            constraintSet.constrainHeight(actionBarLayout.getId(), ConstraintLayout.LayoutParams.MATCH_PARENT);
            
            // Reorient action bar contents for landscape
            ConstraintSet actionBarConstraints = new ConstraintSet();
            actionBarConstraints.clone(actionBarLayout);
            actionBarConstraints.clear(flashButton.getId(), ConstraintSet.START);
            actionBarConstraints.clear(flashButton.getId(), ConstraintSet.TOP);
            actionBarConstraints.connect(flashButton.getId(), ConstraintSet.TOP, ConstraintSet.PARENT_ID, ConstraintSet.TOP);
            actionBarConstraints.connect(flashButton.getId(), ConstraintSet.START, ConstraintSet.PARENT_ID, ConstraintSet.START);
            actionBarConstraints.clear(cameraFlipButton.getId(), ConstraintSet.END);
            actionBarConstraints.clear(cameraFlipButton.getId(), ConstraintSet.TOP);
            actionBarConstraints.connect(cameraFlipButton.getId(), ConstraintSet.BOTTOM, ConstraintSet.PARENT_ID, ConstraintSet.BOTTOM);
            actionBarConstraints.connect(cameraFlipButton.getId(), ConstraintSet.START, ConstraintSet.PARENT_ID, ConstraintSet.START);
            actionBarConstraints.applyTo(actionBarLayout);
            
        } else {
            // Portrait orientation - restore default layouts
            constraintSet.clear(controlsLayout.getId(), ConstraintSet.END);
            constraintSet.clear(controlsLayout.getId(), ConstraintSet.TOP);
            constraintSet.clear(controlsLayout.getId(), ConstraintSet.BOTTOM);
            constraintSet.connect(controlsLayout.getId(), ConstraintSet.BOTTOM, ConstraintSet.PARENT_ID, ConstraintSet.BOTTOM);
            constraintSet.connect(controlsLayout.getId(), ConstraintSet.START, ConstraintSet.PARENT_ID, ConstraintSet.START);
            constraintSet.connect(controlsLayout.getId(), ConstraintSet.END, ConstraintSet.PARENT_ID, ConstraintSet.END);
            
            // Set width and height for portrait
            constraintSet.constrainWidth(controlsLayout.getId(), ConstraintLayout.LayoutParams.MATCH_PARENT);
            constraintSet.constrainHeight(controlsLayout.getId(), ConstraintLayout.LayoutParams.WRAP_CONTENT);
            
            // Update zoom buttons to horizontal
            zoomButtonsContainer.setOrientation(LinearLayout.HORIZONTAL);
            
            // Update flash modes bar layout for portrait
            if (flashModesBar != null) {
                flashModesBar.setOrientation(LinearLayout.HORIZONTAL);
                ConstraintSet actionBarConstraints = new ConstraintSet();
                actionBarConstraints.clone((ConstraintLayout) flashModesBar.getParent());
                actionBarConstraints.clear(flashModesBar.getId(), ConstraintSet.START);
                actionBarConstraints.clear(flashModesBar.getId(), ConstraintSet.TOP);
                actionBarConstraints.connect(flashModesBar.getId(), ConstraintSet.START, flashButton.getId(), ConstraintSet.END);
                actionBarConstraints.connect(flashModesBar.getId(), ConstraintSet.TOP, flashButton.getId(), ConstraintSet.TOP);
                actionBarConstraints.applyTo((ConstraintLayout) flashModesBar.getParent());
            }
            
            // Restore action bar to top in portrait
            constraintSet.clear(actionBarLayout.getId(), ConstraintSet.START);
            constraintSet.clear(actionBarLayout.getId(), ConstraintSet.BOTTOM);
            constraintSet.connect(actionBarLayout.getId(), ConstraintSet.TOP, ConstraintSet.PARENT_ID, ConstraintSet.TOP);
            constraintSet.connect(actionBarLayout.getId(), ConstraintSet.START, ConstraintSet.PARENT_ID, ConstraintSet.START);
            constraintSet.connect(actionBarLayout.getId(), ConstraintSet.END, ConstraintSet.PARENT_ID, ConstraintSet.END);
            
            // Set width and height for action bar in portrait
            constraintSet.constrainWidth(actionBarLayout.getId(), ConstraintLayout.LayoutParams.MATCH_PARENT);
            constraintSet.constrainHeight(actionBarLayout.getId(), ConstraintLayout.LayoutParams.WRAP_CONTENT);
            
            // Reorient action bar contents for portrait
            ConstraintSet actionBarConstraints = new ConstraintSet();
            actionBarConstraints.clone(actionBarLayout);
            actionBarConstraints.clear(flashButton.getId(), ConstraintSet.TOP);
            actionBarConstraints.clear(flashButton.getId(), ConstraintSet.START);
            actionBarConstraints.connect(flashButton.getId(), ConstraintSet.START, ConstraintSet.PARENT_ID, ConstraintSet.START);
            actionBarConstraints.connect(flashButton.getId(), ConstraintSet.TOP, ConstraintSet.PARENT_ID, ConstraintSet.TOP);
            actionBarConstraints.clear(cameraFlipButton.getId(), ConstraintSet.START);
            actionBarConstraints.clear(cameraFlipButton.getId(), ConstraintSet.BOTTOM);
            actionBarConstraints.connect(cameraFlipButton.getId(), ConstraintSet.END, ConstraintSet.PARENT_ID, ConstraintSet.END);
            actionBarConstraints.connect(cameraFlipButton.getId(), ConstraintSet.TOP, ConstraintSet.PARENT_ID, ConstraintSet.TOP);
            actionBarConstraints.applyTo(actionBarLayout);
        }
        
        // Apply all constraint changes with a transition
        Transition transition = new ChangeBounds();
        transition.setDuration(300); // 300ms animation
        TransitionManager.beginDelayedTransition(rootLayout, transition);
        constraintSet.applyTo(rootLayout);
        
    } catch (Exception e) {
        Log.e(TAG, "Error updating UI for orientation: " + e.getMessage());
        e.printStackTrace();
    }
}

    
    // Wide Lens Camera Methods
     @ExperimentalCamera2Interop
    private void switchToWideAngleCamera() {
        if (!hasUltraWideCamera || cameraFacing != CameraSelector.LENS_FACING_BACK) {
            // Wide angle not available or front camera is active
            Toast.makeText(this, "Wide angle camera not available", Toast.LENGTH_SHORT).show();
            return;
        }
        
        if (!usingUltraWideCamera) {
            usingUltraWideCamera = true;
            
            // Disable flash for ultra-wide camera
            setFlashMode(ImageCapture.FLASH_MODE_OFF);
            
            updateZoomButtonsState();
            startCamera(); // Restart camera with wide angle
        }
    }
    
    private void switchToNormalCamera() {
        if (usingUltraWideCamera) {
            usingUltraWideCamera = false;
            updateZoomButtonsState();
            startCamera(); // Restart camera with normal lens
        }
    }
    
    private void updateZoomButtonsState() {
        if (usingUltraWideCamera) {
            wideAngleButton.setBackground(getDrawable(getResources().getIdentifier("circular_button_selected", "drawable", getPackageName())));
            wideAngleButton.setTextColor(getResources().getColor(android.R.color.black));
            normalZoomButton.setBackground(getDrawable(getResources().getIdentifier("circular_button", "drawable", getPackageName())));
            normalZoomButton.setTextColor(getResources().getColor(android.R.color.white));
            
            // Disable flash controls for ultra-wide camera
            flashButton.setAlpha(0.5f);
            flashButton.setEnabled(false);
        } else {
            normalZoomButton.setBackground(getDrawable(getResources().getIdentifier("circular_button_selected", "drawable", getPackageName())));
            normalZoomButton.setTextColor(getResources().getColor(android.R.color.black));
            wideAngleButton.setBackground(getDrawable(getResources().getIdentifier("circular_button", "drawable", getPackageName())));
            wideAngleButton.setTextColor(getResources().getColor(android.R.color.white));
            
            // Re-enable flash controls for normal camera
            flashButton.setAlpha(1.0f);
            flashButton.setEnabled(true);
        }
    }
    
    @ExperimentalCamera2Interop
    private void detectUltraWideCamera(ProcessCameraProvider cameraProvider) {
        try {
            hasUltraWideCamera = false;
            for (CameraInfo cameraInfo : cameraProvider.getAvailableCameraInfos()) {
                Camera2CameraInfo camera2CameraInfo = Camera2CameraInfo.from(cameraInfo);
                int lensFacing = camera2CameraInfo.getCameraCharacteristic(
                        CameraCharacteristics.LENS_FACING);
                
                if (lensFacing == CameraSelector.LENS_FACING_BACK) {
                    float[] focalLengths = camera2CameraInfo.getCameraCharacteristic(
                            CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS);
                    
                    if (focalLengths != null && focalLengths.length > 0) {
                        // Ultra-wide lenses typically have shorter focal lengths
                        if (focalLengths[0] < 2.0f) { // Approximate threshold
                            hasUltraWideCamera = true;
                            break;
                        }
                    }
                }
            }
            
            // Update wide angle button visibility
            wideAngleButton.setVisibility(hasUltraWideCamera ? View.VISIBLE : View.GONE);
            
        } catch (Exception e) {
            Log.e(TAG, "Error detecting camera types: " + e.getMessage());
        }
    }
    
    @ExperimentalCamera2Interop
    private CameraSelector createUltraWideCameraSelector() {
        return new CameraSelector.Builder()
            .requireLensFacing(CameraSelector.LENS_FACING_BACK)
            .addCameraFilter(cameraInfos -> {
                // Filter to find cameras with shortest focal length (ultra-wide)
                List<CameraInfo> backCameras = new ArrayList<>();
                CameraInfo selectedCamera = null;
                float shortestFocalLength = Float.MAX_VALUE;
                
                for (CameraInfo info : cameraInfos) {
                    try {
                        Camera2CameraInfo camera2Info = Camera2CameraInfo.from(info);
                        int lensFacing = camera2Info.getCameraCharacteristic(
                                CameraCharacteristics.LENS_FACING);
                        
                        if (lensFacing == CameraSelector.LENS_FACING_BACK) {
                            backCameras.add(info);
                            
                            float[] focalLengths = camera2Info.getCameraCharacteristic(
                                    CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS);
                            
                            if (focalLengths != null && focalLengths.length > 0 && 
                                    focalLengths[0] < shortestFocalLength) {
                                shortestFocalLength = focalLengths[0];
                                selectedCamera = info;
                            }
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Error examining camera: " + e.getMessage());
                    }
                }
                
                if (selectedCamera != null) {
                    return Collections.singletonList(selectedCamera);
                }
                
                return backCameras;
            })
            .build();
    }

    @ExperimentalCamera2Interop
    private void startCamera() {
        ListenableFuture<ProcessCameraProvider> cameraProviderFuture = 
                ProcessCameraProvider.getInstance(this);
        
        cameraProviderFuture.addListener(() -> {
            try {
                // Camera provider is now guaranteed to be available
                ProcessCameraProvider cameraProvider = cameraProviderFuture.get();

                ResolutionSelector resolutionSelector = new ResolutionSelector.Builder()
                    .build();

                // Check if device has ultra-wide camera
                if (cameraFacing == CameraSelector.LENS_FACING_BACK) {
                    detectUltraWideCamera(cameraProvider);
                } else {
                    // No wide angle for front camera
                    hasUltraWideCamera = false;
                    usingUltraWideCamera = false;
                }
                
                // Update button states
                updateZoomButtonsState();


                // Set up the preview use case
                Preview preview = new Preview.Builder()
                    .setResolutionSelector(resolutionSelector)
                    .build();

                previewView.setScaleType(PreviewView.ScaleType.FIT_CENTER);
                preview.setSurfaceProvider(previewView.getSurfaceProvider());
                
                // Set up the capture use case
                imageCapture = new ImageCapture.Builder()
                        .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                        .setResolutionSelector(resolutionSelector)
                        .setTargetRotation(getCameraRotation())
                        .setFlashMode(flashMode)
                        .build();
                
                // Select appropriate camera
                CameraSelector cameraSelector;
                if (usingUltraWideCamera && hasUltraWideCamera && cameraFacing == CameraSelector.LENS_FACING_BACK) {
                    cameraSelector = createUltraWideCameraSelector();
                } else {
                    // Use standard camera selector
                    cameraSelector = new CameraSelector.Builder()
                            .requireLensFacing(cameraFacing)
                            .build();
                }
                
                // Unbind any bound use cases before rebinding
                cameraProvider.unbindAll();
                
                // Bind use cases to camera
                camera = cameraProvider.bindToLifecycle(
                        ((LifecycleOwner) this),
                        cameraSelector,
                        preview,
                        imageCapture);
                
                // Update camera zoom state when switching cameras
                if (camera != null) {
                    camera.getCameraInfo().getZoomState().observe(this, zoomState -> {
                        if (zoomState != null) {
                                  
                            // Update zoom display if changed externally
                            if (!isUserControllingZoom && zoomState.getZoomRatio() != 1.0f) {
                                float minZoom = Math.max(0.5f, zoomState.getMinZoomRatio());
                                float maxZoom = zoomState.getMaxZoomRatio();
                                float zoomRatio = zoomState.getZoomRatio();
                                
                                // Calculate and set slider position
                                float zoomProgress = ((zoomRatio - minZoom) / (maxZoom - minZoom)) * 100;
                                zoomSeekBar.setProgress((int)zoomProgress);
                                
                                // Update text display
                                updateZoomLevelDisplay(zoomRatio);
                            }
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
        if (orientationListener != null) {
        orientationListener.disable();
    }
        super.onDestroy();
        
        if (!executor.isShutdown()) {
            executor.shutdown();
        }

        handler.removeCallbacks(hideZoomLevelRunnable);
        handler.removeCallbacks(hideZoomControlsRunnable);
        System.gc();
    }
}
