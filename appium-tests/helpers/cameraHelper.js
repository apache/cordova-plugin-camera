/*jshint node: true */
/* global Q */
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

'use strict';

var cameraConstants = require('../../www/CameraConstants');

function findKeyByValue(set, value) {
   for (var k in set) {
      if (set.hasOwnProperty(k)) {
         if (set[k] == value) {
            return k;
         }
      }
   }
   return undefined;
}

function getDescription(spec) {
    var desc = '';

    desc += 'sourceType: ' + findKeyByValue(cameraConstants.PictureSourceType, spec.options.sourceType);
    desc += ', destinationType: ' + findKeyByValue(cameraConstants.DestinationType, spec.options.destinationType);
    desc += ', encodingType: ' + findKeyByValue(cameraConstants.EncodingType, spec.options.encodingType);
    desc += ', allowEdit: ' + spec.options.allowEdit.toString();
    desc += ', correctOrientation: ' + spec.options.correctOrientation.toString();

    return desc;
}

module.exports.generateSpecs = function (sourceTypes, destinationTypes, encodingTypes, allowEditOptions, correctOrientationOptions) {
    var destinationType,
        sourceType,
        encodingType,
        allowEdit,
        correctOrientation,
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
                                    for (correctOrientation in correctOrientationOptions) {
                                        // if taking picture from photolibrary, don't vary 'correctOrientation' option
                                        if ((sourceTypes[sourceType] === cameraConstants.PictureSourceType.PHOTOLIBRARY ||
                                            sourceTypes[sourceType] === cameraConstants.PictureSourceType.SAVEDPHOTOALBUM) &&
                                            correctOrientation === true) { continue; }
                                        var spec = {
                                            'id': id++,
                                            'options': {
                                                'destinationType': destinationTypes[destinationType],
                                                'sourceType': sourceTypes[sourceType],
                                                'encodingType': encodingTypes[encodingType],
                                                'allowEdit': allowEditOptions[allowEdit],
                                                'saveToPhotoAlbum': false,
                                                'correctOrientation': correctOrientationOptions[correctOrientation]
                                            }
                                        };
                                        spec.description = getDescription(spec);
                                        specs.push(spec);
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

module.exports.getPicture = function (opts, pid) {
    navigator._appiumPromises[pid] = Q.defer();
    navigator.camera.getPicture(function (result) {
        navigator._appiumPromises[pid].resolve(result);
    }, function (err) {
        navigator._appiumPromises[pid].reject(err);
    }, opts);
};

module.exports.checkPicture = function (pid, cb) {
    navigator._appiumPromises[pid].promise
        .then(function (result) {
            cb(result);
        }, function (err) {
            cb('ERROR: ' + err);
        });
};
