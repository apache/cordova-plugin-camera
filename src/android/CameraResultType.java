package org.apache.cordova.camera;

public enum CameraResultType {
    BASE64("base64"),
    URI("uri"),
    DATAURL("dataUrl");

    private String type;

    CameraResultType(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }
}
