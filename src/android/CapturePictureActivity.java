package org.apache.cordova.camera;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

import fr.idcapture.R;
import android.app.Activity;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Bitmap.CompressFormat;
import android.hardware.Camera;
import android.hardware.Camera.PictureCallback;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
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
		setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_NOSENSOR);

		getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);

		Bundle extras = getIntent().getExtras();
		isFrontCam = extras.getBoolean(EXTRA_FRONT_FACING_CAMERA);
		outputUri = (Uri) extras.getParcelable(EXTRA_OUTPUT);
		compressFormat = CompressFormat.valueOf(extras.getString(EXTRA_COMPRESS_FORMAT));

		super.onCreate(savedInstanceState);

		RelativeLayout layout = new RelativeLayout(this);
		addContentView(layout, new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));

		cameraPreview = new CameraPreview(this, resolveCamera());
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
		switchButton.setImageDrawable(getResources().getDrawable(R.drawable.switch_camera));
		switchButton.setLayoutParams(p);
		switchButton.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				Log.i(TAG, "switch camera");

				isFrontCam = !isFrontCam;
				cameraPreview.release();
				cameraPreview.setCamera(resolveCamera());
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
		okButton.setImageDrawable(getResources().getDrawable(R.drawable.tick));
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
	}

	private void saveCaptureData() {
		try {
			Log.d(TAG, "saving capture data to " + outputUri);
			OutputStream out = getContentResolver().openOutputStream(outputUri);
			try {
				Bitmap image = BitmapFactory.decodeByteArray(captureImageData, 0, captureImageData.length);
				image.compress(compressFormat, 50, out);
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

	private Camera resolveCamera() {
		Camera camera = null;
		if (Integer.valueOf(android.os.Build.VERSION.SDK) >= 9) {

			Camera.CameraInfo camInfo = new Camera.CameraInfo();
			for (int i = 0; i < Camera.getNumberOfCameras(); i++) {
				Camera.getCameraInfo(i, camInfo);
				boolean isFacingFrontCamera = camInfo.facing == Camera.CameraInfo.CAMERA_FACING_FRONT;
				Log.i(TAG, i + ": " + isFacingFrontCamera);
				if (isFacingFrontCamera == isFrontCam) {
					camera = Camera.open(i);
					break;
				}
			}
		}

		if (camera == null) {
			camera = Camera.open();
		}

		return camera;
	}

	private class CameraPreview extends SurfaceView implements SurfaceHolder.Callback {
		private SurfaceHolder mHolder;
		private Camera camera;

		public CameraPreview(Context context, Camera camera) {
			super(context);
			setCamera(camera);

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

		public void setCamera(Camera camera) {
			if (this.camera != null) {
				release();
			}

			this.camera = camera;
			this.camera.setDisplayOrientation(isLandscape() ? 180 : 90);
		}

		public void surfaceCreated(SurfaceHolder holder) {
			// The Surface has been created, now tell the camera where to draw
			// the preview.
			startPreview();
		}

		public void surfaceDestroyed(SurfaceHolder holder) {
			// empty. Take care of releasing the Camera preview in your
			// activity.
		}

		public void surfaceChanged(SurfaceHolder holder, int format, int w, int h) {
			// If your preview can change or rotate, take care of those events
			// here.
			// Make sure to stop the preview before resizing or reformatting it.

			if (mHolder.getSurface() == null) {
				// preview surface does not exist
				return;
			}

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

				Log.v(TAG, "preview size: " + previewSize.width + " / " + previewSize.height);
				parameters.setPreviewSize(previewSize.width, previewSize.height);
				camera.setParameters(parameters);
				camera.setPreviewDisplay(mHolder);
				camera.startPreview();
			} catch (IOException e) {
				Log.d(TAG, "Error setting camera preview: " + e.getMessage());
			}
		}
	}
}
