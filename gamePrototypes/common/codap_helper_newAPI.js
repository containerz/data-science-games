/**
 * Created by bfinzer on 2/7/15.
 * updated for new API by Tim and Jonathan, 2016-05-25
 */

/* global console, iframePhone */

var codapHelper = {
    codapPhone: null,
    initFrameAccomplished: false,
    initDataSetAccomplished: false,

    initDataInteractive: function (iFrameDescription, iDataSetDescription, doCommandFunc) {
        this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(doCommandFunc, "data-interactive", window.parent);

        this.codapPhone.call(
            {
                action: 'update',
                resource: 'interactiveFrame',
                values: iFrameDescription
            }, function (iResult) {
                if (iResult) {
                    this.initFrameAccomplished = true;
                }
            }.bind(this));

        this.codapPhone.call(
            {
                action: 'create',
                resource: 'dataContext',
                values: iDataSetDescription
            }, function (iResult) {
                if (iResult) {
                    this.initDataSetAccomplished = true;
                }
            }.bind(this));
    },

    checkForCODAP: function () {

        if (!this.initDataSetAccomplished) {
            window.alert('Please drag my URL to a CODAP document.');
            return false;
        }
        else {
            console.log('CODAP detected. Whew.');
            return true;
        }

    },

    createCase: function (iCollectionName, iValuesArray, iCallback) {
        this.createCases(iCollectionName, iValuesArray, iCallback);
    },

    createCases: function (iCollectionName, iValuesArrays, iCallback) {
        if (this.checkForCODAP()) {
            if (iValuesArrays && !Array.isArray(iValuesArrays)) {
                iValuesArrays = [iValuesArrays];
            }

            var tCodapPhoneArg = {
                action: 'create',
                resource: 'collection[' + iCollectionName + '].case',
                values: iValuesArrays
            };

            this.codapPhone.call(tCodapPhoneArg, iCallback);
        }
    },

    updateCase: function (iCollectionName, iValues, iCaseID, iCallback) {
        console.log("Update case " + iCaseID + " in " + iCollectionName);
        if (iValues && !Array.isArray(iValues)) {
            iValues = [iValues];
        }
        this.codapPhone.call({
                action: 'update',
                resource: 'collection[' + iCollectionName + "].caseByID[" + iCaseID + "]",
                values: iValues
            },
            iCallback
        );
    },



};
