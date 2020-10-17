package org.apache.cordova.camera;

public class GalleryPathVO {
    private final String galleryPath;
    private String picturesDirectory;
    private String galleryFileName;

    public GalleryPathVO(String picturesDirectory, String galleryFileName) {
        this.picturesDirectory = picturesDirectory;
        this.galleryFileName = galleryFileName;
        this.galleryPath = this.picturesDirectory + "/" + this.galleryFileName;
    }

    public String getGalleryPath() {
        return galleryPath;
    }

    public String getPicturesDirectory() {
        return picturesDirectory;
    }

    public String getGalleryFileName() {
        return galleryFileName;
    }
}
