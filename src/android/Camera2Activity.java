package org.apache.cordova.camera;

import android.Manifest;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import androidx.camera.core.Camera;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.LifecycleOwner;
import android.widget.Button;
import com.google.common.util.concurrent.ListenableFuture;

public class CameraActivity extends androidx.appcompat.app.AppCompatActivity {
    private PreviewView previewView;
    private ImageCapture imageCapture;
    private Camera camera;
    private int flashMode = ImageCapture.FLASH_MODE_AUTO; // Default flash mode

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Get flash mode from intent
        flashMode = getIntent().getIntExtra("flashMode", ImageCapture.FLASH_MODE_AUTO);
        
        // Set up the camera and preview
        startCamera();
    }

    private void startCamera() {
        ListenableFuture<ProcessCameraProvider> cameraProviderFuture = 
            ProcessCameraProvider.getInstance(this);

        cameraProviderFuture.addListener(() -> {
            try {
                ProcessCameraProvider cameraProvider = cameraProviderFuture.get();
                bindPreview(cameraProvider);
            } catch (Exception e) {
                // Handle any errors
            }
        }, ContextCompat.getMainExecutor(this));
    }

    private void bindPreview(ProcessCameraProvider cameraProvider) {
        Preview preview = new Preview.Builder().build();

        imageCapture = new ImageCapture.Builder()
            .setFlashMode(flashMode)
            .build();

        CameraSelector cameraSelector = new CameraSelector.Builder()
            .requireLensFacing(CameraSelector.LENS_FACING_BACK)
            .build();

        camera = cameraProvider.bindToLifecycle(
            ((LifecycleOwner) this),
            cameraSelector,
            preview,
            imageCapture);

        preview.setSurfaceProvider(previewView.getSurfaceProvider());
    }

    private void takePicture() {
        String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(new Date());
        ContentValues contentValues = new ContentValues();
        contentValues.put(MediaStore.MediaColumns.DISPLAY_NAME, timestamp);
        contentValues.put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg");

        ImageCapture.OutputFileOptions outputFileOptions = 
            new ImageCapture.OutputFileOptions.Builder(
                getContentResolver(),
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                contentValues)
            .build();

        imageCapture.takePicture(outputFileOptions, 
            ContextCompat.getMainExecutor(this),
            new ImageCapture.OnImageSavedCallback() {
                @Override
                public void onImageSaved(ImageCapture.OutputFileResults outputFileResults) {
                    Uri savedUri = outputFileResults.getSavedUri();
                    // Return the image URI to Cordova
                    Intent intent = new Intent();
                    intent.setData(savedUri);
                    setResult(RESULT_OK, intent);
                    finish();
                }

                @Override
                public void onError(ImageCaptureException error) {
                    // Handle error
                    setResult(RESULT_CANCELED);
                    finish();
                }
            });
    }
}
