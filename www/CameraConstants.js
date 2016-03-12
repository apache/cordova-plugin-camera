/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

/**
 * @module Camera
 */
module.exports = {
  /**
   * @enum {number}
   */
  DestinationType:{
    /** Return base64 encoded string */
    DATA_URL: 0,
    /** Return file uri (content://media/external/images/media/2 for Android) */
    FILE_URI: 1,
    /** Return native uri (eg. asset-library://... for iOS) */
    NATIVE_URI: 2
  },
  /**
   * @enum {number}
   */
  EncodingType:{
    /** Return JPEG encoded image */
    JPEG: 0,
    /** Return PNG encoded image */
    PNG: 1
  },
  /**
   * Author: @TanaseButcaru, 20160111; getVideo() support
   * @enum {number}
   */
  VideoEncodingType:{
    /** Return 3GP encoded video */
    GPP: 2,
    /** Return MP4 encoded video */
    MP4: 3,
    /** Return WEBM encoded video */
    WEBM: 4,
    /** Return MKV encoded video */
    MKV: 5
  },
  /**
   * @enum {number}
   */
  MediaType:{
    /** Allow selection of still pictures only. DEFAULT. Will return format specified via DestinationType */
    PICTURE: 0,
    /** Allow selection of video only, ONLY RETURNS URL */
    VIDEO: 1,
    /** Allow selection from all media types */
    ALLMEDIA : 2
  },
  /**
   * Author: @TanaseButcaru, 20160111; getVideo() support
   * @enum {number}
   */
  MediaThumbnail:{
    /** Media thumbnail disabled */
    NONE: 0,
    /** Creates a thumbnail of 512x384 px */
    MINI_KIND: 1,
    /** Creates a thumbnail of 96x96 px */
    MICRO_KIND: 2
  },
  /**
   * @enum {number}
   */
  PictureSourceType:{
    /** Choose image from picture library (same as SAVEDPHOTOALBUM for Android) */
    PHOTOLIBRARY : 0,
    /** Take picture from camera */
    CAMERA : 1,
    /** Choose image from picture library (same as PHOTOLIBRARY for Android) */
    SAVEDPHOTOALBUM : 2
  },
  /**
   * Author: @TanaseButcaru, 20160111; getVideo() support
   * @enum {number}
   */
  VideoSourceType:{
    /** Choose video from video library */
    VIDEOLIBRARY : 0,
    /** Take video from camera */
    CAMERA : 1
  },
  /**
   * Author: @TanaseButcaru, 20160111; getVideo() support
   * @enum {number}
   */
  VideoQuality:{
    /**  Low quality, suitable for MMS messages */
    LOW : 0,
    /** High quality */
    HIGH: 1
  },
  /**
   * Matches iOS UIPopoverArrowDirection constants to specify arrow location on popover.
   * @enum {number}
   */
  PopoverArrowDirection:{
      ARROW_UP : 1,
      ARROW_DOWN : 2,
      ARROW_LEFT : 4,
      ARROW_RIGHT : 8,
      ARROW_ANY : 15
  },
  /**
   * @enum {number}
   */
  Direction:{
      /** Use the back-facing camera */
      BACK: 0,
      /** Use the front-facing camera */
      FRONT: 1
  }
};
