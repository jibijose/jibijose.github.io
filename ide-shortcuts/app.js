function preg_quote(str, delimiter) {
    return String(str)
        .replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
}

String.prototype.contains = function(it) { return this.indexOf(it) != -1; };
var map = {};
OSName = "Win"
// app.js
angular.module('ideShortcuts', ['ngSanitize','ngStorage'])
    .filter('highlight', function ($sce) {
        return function (text, phrase) {
            if (phrase && text.toLowerCase().contains(phrase))
                text = text.replace( new RegExp( "(" + preg_quote( phrase ) + ")" , 'gi' ), '<span class="highlighted">$1</span>' );
            
            return $sce.trustAsHtml(text)
        }
    })

    .controller('mainController', function ($scope,$http,$localStorage) {
        $scope.keyPressed = '';
        $scope.search = '';

        specialKeyMap = [{37 : 'Left'}, {38 : 'Up'}, {39 : 'Right'}, {40 : 'Down'}];

        var isModifierPressed = function (event) {
            if ( OSName == "MacOS" ) {
                return event.ctrlKey || event.altKey || event.shiftKey || isCmdKeyDown();
            } else {
                return event.ctrlKey || event.altKey || event.shiftKey;
            }
        };
        var specialKeyPressed = function (keyCode) {
            specialKey = specialKeyMap.filter((specialKey) => {return keyCode in  specialKey});
            return (specialKey && specialKey.length > 0 ) ? specialKey[0] : null;
        };

        var isValidCharacterKeyCode = function(param){
            return (param > 47 && param < 58) || // number keys
                //param == 32 || // spacebar
                (param > 64 && param < 91) || // letter keys
                (param > 95 && param < 112) || // numpad keys
                (param > 185 && param < 193) || // ;=,-./` (in order)
                (param > 218 && param < 223);   // [\]' (in order)
        };

        var isCmdKeyDown = function () {
            if ( OSName == "MacOS" ) {
                return map[91];
            }
            return false;
        }

        var isSpaceKeyPressed = function (event) {
            if ( event.keyCode == 32 ) {
                return true;
            }
            return false;
        }

        $scope.onKeyDown = function (event) {
            //console.log("KEYDOWN " + event.keyCode);
            map[event.keyCode] = true;
            if (isModifierPressed(event)) {
                var result = '';
                if ( OSName == "MacOS" )  {
                    if (event.ctrlKey)
                        result += '⌃ + ';
                    if (event.altKey)
                        result += '⌥ + ';
                    if (event.shiftKey)
                        result += '⇧ + ';
                    if ( isCmdKeyDown() )
                        result += '⌘ + ';
                } else {
                    if (event.ctrlKey )
                        result += 'Ctrl + ';
                    if (event.shiftKey)
                        result += 'Shift + ';
                    if (event.altKey)
                        result += 'Alt + ';
                }

                if ( isSpaceKeyPressed(event) ) {
                    result += "Space";
                }
                
                event.preventDefault();
                $scope.search = result;
                if(isValidCharacterKeyCode(event.keyCode))
                    $scope.search += String.fromCharCode(event.which);
                else{
                    var specialKey = specialKeyPressed(event.keyCode)
                    if (specialKey != null){
                        var result = result || '';
                        result += specialKey[event.keyCode];
                        event.preventDefault();
                        $scope.search = result;
                    }
                }  
            }
            else {
                if($scope.search.contains('+'))
                    $scope.search = '';
            }
        };

        $scope.onKeyUp = function (event) {
            //console.log("KEYUP " + event.keyCode);
            map[event.keyCode] = false;
        }

        $scope.onKeyPress = function (event) {
            //console.log("KEYPRESS " + event.keyCode);
        }

        const shortcutsFile = 'shortcuts.json';

        // only for testing
        $scope.reset = function() {
            $http.get(shortcutsFile).then(function (res) {
                $scope.shortcutTables = res.data;
                $localStorage.tables = res.data;
            });
        };

        // only for testing
        $scope.clear = function() {
            $scope.shortcutTables = null;
            delete $localStorage.tables;
        };

        $scope.shortcutTables = $localStorage.tables;
        if($scope.shortcutTables == null)
        {
            $http.get(shortcutsFile).then(function (res) {
                $scope.shortcutTables = res.data;
                $localStorage.tables = res.data;
            });
        }

    });


