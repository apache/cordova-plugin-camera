package org.apache.cordova.camera;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

import android.app.Activity;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.Matrix;
import android.hardware.Camera;
import android.hardware.Camera.CameraInfo;
import android.hardware.Camera.PictureCallback;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.Surface;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.LinearLayout.LayoutParams;
import android.widget.RelativeLayout;

public class CapturePictureActivity extends Activity {

	public static final String EXTRA_COMPRESS_FORMAT = "CapturePictureActivity.EXTRA_COMPRESS_FORMAT";
	public static final String EXTRA_FRONT_FACING_CAMERA = "CapturePictureActivity.EXTRA_FRONT_FACING_CAMERA";
	public static final String EXTRA_OUTPUT = "CapturePictureActivity.EXTRA_OUTPUT";

	final static String TAG = "CapturePictureActivity";

	private boolean isFrontCam;
	private Uri outputUri;

	private CameraPreview cameraPreview;
	private ImageView switchButton;
	private ImageView okButton;

	private byte[] captureImageData;
	private boolean takingPicture;
	private boolean saveRequested;

	private CompressFormat compressFormat;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		
		Log.v(TAG, "create picture taker");

		getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);

		Bundle extras = getIntent().getExtras();
		isFrontCam = extras.getBoolean(EXTRA_FRONT_FACING_CAMERA);
		outputUri = (Uri) extras.getParcelable(EXTRA_OUTPUT);
		compressFormat = CompressFormat.valueOf(extras.getString(EXTRA_COMPRESS_FORMAT));
		
		super.onCreate(savedInstanceState);

		RelativeLayout layout = new RelativeLayout(this);
		addContentView(layout, new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));

		cameraPreview = new CameraPreview(this);
		resolveCamera();
		cameraPreview.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				Log.i(TAG, "taking picture");
				if (takingPicture) {
					Log.i(TAG, "canceled");
					okButton.setVisibility(View.GONE);
					cameraPreview.startPreview();
					takingPicture = false;
				} else {
					okButton.setVisibility(View.VISIBLE);
					captureImageData = null;
					takingPicture = true;
					saveRequested = false;
					cameraPreview.started = false;
					cameraPreview.camera.takePicture(null, new PictureCallback() {

						@Override
						public void onPictureTaken(byte[] data, Camera camera) {
							Log.i(TAG, "bmp taken, size: " + data);
						}
					}, new PictureCallback() {

						@Override
						public void onPictureTaken(byte[] data, Camera camera) {
							Log.i(TAG, "jpg taken, size: " + data);
							synchronized (CapturePictureActivity.this) {
								if (takingPicture) {
									captureImageData = data;
									if (saveRequested) {
										saveCaptureData();
									}
								}
							}
						}
					});
				}
			}
		});
		layout.addView(cameraPreview);

		RelativeLayout.LayoutParams p = new RelativeLayout.LayoutParams(100, 100);
		p.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM, RelativeLayout.TRUE);
		p.addRule(RelativeLayout.ALIGN_PARENT_LEFT, RelativeLayout.TRUE);
		p.leftMargin = 10;
		p.bottomMargin = 10;

		switchButton = new ImageView(this);
        int switchResId = getResources().getIdentifier("switch_camera", "drawable", getApplicationContext().getPackageName());
		switchButton.setImageDrawable(getResources().getDrawable(switchResId));
		switchButton.setLayoutParams(p);
		switchButton.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				Log.i(TAG, "switch camera");

				isFrontCam = !isFrontCam;
				cameraPreview.release();
				resolveCamera();
				cameraPreview.startPreview();
			}
		});
		layout.addView(switchButton);

		p = new RelativeLayout.LayoutParams(80, 80);
		p.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM, RelativeLayout.TRUE);
		p.addRule(RelativeLayout.ALIGN_PARENT_RIGHT, RelativeLayout.TRUE);
		p.rightMargin = 20;
		p.bottomMargin = 20;

		okButton = new ImageView(this);
		int okResId = getResources().getIdentifier("tick", "drawable", getApplicationContext().getPackageName());
		okButton.setImageDrawable(getResources().getDrawable(okResId));
		okButton.setLayoutParams(p);
		okButton.setVisibility(View.GONE);
		okButton.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				Log.i(TAG, "switch camera");

				synchronized (CapturePictureActivity.this) {
					if (captureImageData == null) {
						saveRequested = true;
					} else {
						saveCaptureData();
					}
				}
			}
		});
		layout.addView(okButton);

		cameraPreview.startPreview();
	}

	private void saveCaptureData() {
		try {
			Log.d(TAG, "saving capture data to " + outputUri);
			OutputStream out = getContentResolver().openOutputStream(outputUri);
			try {
				Matrix matrix = new Matrix();
				// matrix.postRotate(isLandscape() ? -180 : -90);

				Bitmap image = BitmapFactory.decodeByteArray(captureImageData, 0, captureImageData.length);
				Bitmap rotated = Bitmap.createBitmap(image, 0, 0, image.getWidth(), image.getHeight(), matrix, true);
				rotated.compress(compressFormat, 50, out);
				out.flush();
				out.close();
				Log.d(TAG, "captured image saved");
				setResult(RESULT_OK);
				finish();
			} finally {
			}
		} catch (IOException e) {
			// Log.e(TAG, "cannot write image", e);
			throw new RuntimeException("cannot save captured image", e);
		}
	}

	@Override
	protected void onDestroy() {
		super.onDestroy();

		cameraPreview.camera.release();
	}

	protected boolean isLandscape() {
		return getResources().getConfiguration().orientation == Configuration.ORIENTATION_LANDSCAPE;
	}

	private void resolveCamera() {
		Camera camera = null;
		if (Integer.valueOf(android.os.Build.VERSION.SDK) >= 9) {

			Camera.CameraInfo camInfo = new Camera.CameraInfo();
			for (int i = 0; i < Camera.getNumberOfCameras(); i++) {
				Camera.getCameraInfo(i, camInfo);
				boolean isFacingFrontCamera = camInfo.facing == Camera.CameraInfo.CAMERA_FACING_FRONT;
				Log.i(TAG, i + ": " + isFacingFrontCamera);
				if (isFacingFrontCamera == isFrontCam) {
					cameraPreview.setCamera(Camera.open(i), camInfo.orientation);
					return;
				}
			}
		}

		if (camera == null) {
			cameraPreview.setCamera(Camera.open(), 0);
		}
	}

	private class CameraPreview extends SurfaceView implements SurfaceHolder.Callback {
		private SurfaceHolder mHolder;
		private Camera camera;
		private int cameraRotationOffset;
		private boolean started;

		public CameraPreview(Context context) {
			super(context);

			// Install a SurfaceHolder.Callback so we get notified when the
			// underlying surface is created and destroyed.
			mHolder = getHolder();
			mHolder.addCallback(this);
			// deprecated setting, but required on Android versions prior to 3.0
			mHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
		}

		public void release() {
			if (camera != null) {
				camera.stopPreview();
				camera.release();
				camera = null;
			}
		}

		public void setCamera(Camera camera, int orientation) {
			if (this.camera != null) {
				release();
			}

			this.camera = camera;
			this.cameraRotationOffset = orientation;
		}

		public void surfaceCreated(SurfaceHolder holder) {
			if (started) {
				startPreview();
			}
		}

		public void surfaceDestroyed(SurfaceHolder holder) {
		}

		public void surfaceChanged(SurfaceHolder holder, int format, int w, int h) {
			if (mHolder.getSurface() == null) {
				// preview surface does not exist
				return;
			}

			if (started) {
				// stop preview before making changes
				try {
					camera.stopPreview();
				} catch (Exception e) {
					// ignore: tried to stop a non-existent preview
				}

				// set preview size and make any resize, rotate or
				// reformatting changes here

				// start preview with new settings
				startPreview();
			}
		}

		public void startPreview() {
			try {

				Camera.Parameters parameters = camera.getParameters();
				List<Camera.Size> previewSizes = parameters.getSupportedPreviewSizes();
				Camera.Size previewSize = null;
				float closestRatio = Float.MAX_VALUE;

				int targetPreviewWidth = isLandscape() ? getWidth() : getHeight();
				int targetPreviewHeight = isLandscape() ? getHeight() : getWidth();
				float targetRatio = targetPreviewWidth / (float) targetPreviewHeight;

				Log.v(TAG, "target size: " + targetPreviewWidth + " / " + targetPreviewHeight + " ratio:" + targetRatio);
				for (Camera.Size candidateSize : previewSizes) {
					float whRatio = candidateSize.width / (float) candidateSize.height;
					if (previewSize == null || Math.abs(targetRatio - whRatio) < Math.abs(targetRatio - closestRatio)) {
						closestRatio = whRatio;
						previewSize = candidateSize;
					}
				}

				int rotation = getWindowManager().getDefaultDisplay().getRotation();
				int degrees = 0;
				switch (rotation) {
				case Surface.ROTATION_0:
					degrees = 0;
					break; // Natural orientation
				case Surface.ROTATION_90:
					degrees = 90;
					break; // Landscape left
				case Surface.ROTATION_180:
					degrees = 180;
					break;// Upside down
				case Surface.ROTATION_270:
					degrees = 270;
					break;// Landscape right
				}
				int displayRotation = Math.abs(degrees - 90);
				Log.v(TAG, "rotation cam / phone = displayRotation: " + cameraRotationOffset + " / " + degrees + " = "
						+ displayRotation);
				this.camera.setDisplayOrientation(displayRotation);

				int rotate = Math.abs(-cameraRotationOffset - degrees) % 360;
				Log.v(TAG, "screenshot rotation: " + cameraRotationOffset + " / " + degrees + " = "
						+ displayRotation);

				Log.v(TAG, "preview size: " + previewSize.width + " / " + previewSize.height);
				parameters.setPreviewSize(previewSize.width, previewSize.height);
				parameters.setRotation(rotate);
				camera.setParameters(parameters);
				camera.setPreviewDisplay(mHolder);
				camera.startPreview();

				Log.d(TAG, "preview started");

				started = true;
			} catch (IOException e) {
				Log.d(TAG, "Error setting camera preview: " + e.getMessage());
			}
		}
	}
}
