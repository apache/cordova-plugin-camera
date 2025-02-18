package org.apache.cordova.camera;

import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.widget.Button;
import androidx.appcompat.app.AppCompatActivity;
import androidx.camera.core.Camera;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.LifecycleOwner;
import com.google.common.util.concurrent.ListenableFuture;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ExecutionException;

public class CameraActivity extends AppCompatActivity {
    private PreviewView previewView;
    private ImageCapture imageCapture;
    private Camera camera;
    private int flashMode = ImageCapture.FLASH_MODE_AUTO;
    private Button captureButton;
    private Uri savedUri;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_camera);

        // Initialize views
        previewView = findViewById(R.id.preview_view);
        captureButton = findViewById(R.id.capture_button);
        
        // Get flash mode from intent
        flashMode = getIntent().getIntExtra("flashMode", ImageCapture.FLASH_MODE_AUTO);
        savedUri = getIntent().getParcelableExtra(MediaStore.EXTRA_OUTPUT);
        
        // Set up capture button click listener
        captureButton.setOnClickListener(v -> takePicture());
        
        // Start camera
        startCamera();
    }

    private void startCamera() {
        ListenableFuture<ProcessCameraProvider> cameraProviderFuture = 
            ProcessCameraProvider.getInstance(this);

        cameraProviderFuture.addListener(() -> {
            try {
                ProcessCameraProvider cameraProvider = cameraProviderFuture.get();
                bindPreview(cameraProvider);
            } catch (ExecutionException | InterruptedException e) {
                // Handle any errors
                e.printStackTrace();
            }
        }, ContextCompat.getMainExecutor(this));
    }

    private void bindPreview(ProcessCameraProvider cameraProvider) {
        // Unbind use cases before rebinding
        cameraProvider.unbindAll();

        Preview preview = new Preview.Builder().build();

        imageCapture = new ImageCapture.Builder()
            .setFlashMode(flashMode)
            .build();

        CameraSelector cameraSelector = new CameraSelector.Builder()
            .requireLensFacing(CameraSelector.LENS_FACING_BACK)
            .build();

        try {
            camera = cameraProvider.bindToLifecycle(
                this,
                cameraSelector,
                preview,
                imageCapture);

            preview.setSurfaceProvider(previewView.getSurfaceProvider());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void takePicture() {
        if (imageCapture == null || savedUri == null) return;

        ImageCapture.OutputFileOptions outputFileOptions;
        
        if (savedUri != null) {
            outputFileOptions = new ImageCapture.OutputFileOptions.Builder(
                getContentResolver(),
                savedUri)
                .build();
        } else {
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(new Date());
            ContentValues contentValues = new ContentValues();
            contentValues.put(MediaStore.MediaColumns.DISPLAY_NAME, timestamp);
            contentValues.put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg");
            
            outputFileOptions = new ImageCapture.OutputFileOptions.Builder(
                getContentResolver(),
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                contentValues)
                .build();
        }

        imageCapture.takePicture(outputFileOptions, 
            ContextCompat.getMainExecutor(this),
            new ImageCapture.OnImageSavedCallback() {
                @Override
                public void onImageSaved(ImageCapture.OutputFileResults outputFileResults) {
                    Uri resultUri = savedUri != null ? savedUri : outputFileResults.getSavedUri();
                    Intent intent = new Intent();
                    intent.setData(resultUri);
                    setResult(RESULT_OK, intent);
                    finish();
                }

                @Override
                public void onError(ImageCaptureException error) {
                    error.printStackTrace();
                    setResult(RESULT_CANCELED);
                    finish();
                }
            });
    }
}
