/**
 * Created by tim on 3/6/16.


 ==========================================================================
 waterManager.js in data-science-games. Main controller for Water

 Author:   Tim Erickson

 Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 ==========================================================================


 */

var water = {};

water.constants = {
    version : "000"
};

water.manager = {
    time : null,

    fixUI : function() {
        $("#timeText").text(water.manager.time.toString());
    },

    initialize : function() {
        this.time = new Date();
        this.fixUI();
    }

}