/*jslint node: true, plusplus: true */
'use strict';

var cameraConstants = require('../../www/CameraConstants');

module.exports.generateSpecs = function (sourceTypes, destinationTypes, encodingTypes, allowEditOptions) {
    var destinationType,
        sourceType,
        encodingType,
        allowEdit,
        specs = [],
        id = 1;
    for (destinationType in destinationTypes) {
        if (destinationTypes.hasOwnProperty(destinationType)) {
            for (sourceType in sourceTypes) {
                if (sourceTypes.hasOwnProperty(sourceType)) {
                    for (encodingType in encodingTypes) {
                        if (encodingTypes.hasOwnProperty(encodingType)) {
                            for (allowEdit in allowEditOptions) {
                                if (allowEditOptions.hasOwnProperty(allowEdit)) {
                                    // if taking picture from photolibrary, don't vary 'correctOrientation' option
                                    if (sourceTypes[sourceType] === cameraConstants.PictureSourceType.PHOTOLIBRARY) {
                                        specs.push({
                                            'id': id++,
                                            'options': {
                                                'destinationType': destinationTypes[destinationType],
                                                'sourceType': sourceTypes[sourceType],
                                                'encodingType': encodingTypes[encodingType],
                                                'allowEdit': allowEditOptions[allowEdit],
                                                'saveToPhotoAlbum': false,
                                            }
                                        });
                                    } else {
                                        specs.push({
                                            'id': id++,
                                            'options': {
                                                'destinationType': destinationTypes[destinationType],
                                                'sourceType': sourceTypes[sourceType],
                                                'encodingType': encodingTypes[encodingType],
                                                'correctOrientation': true,
                                                'allowEdit': allowEditOptions[allowEdit],
                                                'saveToPhotoAlbum': false,
                                            }
                                        }, {
                                            'id': id++,
                                            'options': {
                                                'destinationType': destinationTypes[destinationType],
                                                'sourceType': sourceTypes[sourceType],
                                                'encodingType': encodingTypes[encodingType],
                                                'correctOrientation': false,
                                                'allowEdit': allowEditOptions[allowEdit],
                                                'saveToPhotoAlbum': false,
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return specs;
};
