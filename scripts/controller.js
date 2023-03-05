var connection = new JsStore.Connection(new Worker('scripts/jsstore.worker.min.js'));

if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB.")
}

initDb();

var urls = ['json/con_data.json', 'json/conversation_database.json', 'json/data.json', 'json/database.json', 'json/dictation.json', 'json/drag_match.json', 'json/ep_database.json', 'json/ex_data.json', 'json/exam_data.json', 'json/matchup.json', 'json/memory_match.json', 'json/odd_one_out.json', 'json/reordering.json', 'json/snap.json', 'json/sorting.json', 'json/sound_spelling.json', 'json/sounds_data.json', 'json/sounds_n_spelling.json', 'json/stress.json'];

$.each(urls, function(i,u){ 
     $.ajax(u, 
       { type: 'GET',
       async: false,
         success: function (data) {
             $('#iLoader').remove();
         } 
       }
     );
});

async function initDb() {
    var isDbCreated = await connection.initDb(getiSpeakerDB());
        if (isDbCreated) {
            console.log('Database created');
        }
        else {
            console.log('Database opened');
        }
}
    
function getiSpeakerDB() {
//IndexedDB
    var dbName ='iSpeaker';
    var sounds_review1 = {
        name: 'sounds_review',
        columns: {
            id: { primaryKey: true, autoIncrement: true },
            index_key: { notNull: true, dataType: "number" },
            type: { notNull: true, dataType: "string" },
            language: { notNull: true, dataType: "string" },
            review: { notNull: true, dataType: "number" }
        }
    };
    var conversation_review1 = {
        name: 'conversation_review',
        columns: {
            id: { primaryKey: true, autoIncrement: true },
            index_key: { notNull: true, dataType: "number" },
            type: { notNull: true, dataType: "string" },
            language: { notNull: true, dataType: "string" },
            review: { notNull: false, dataType: "string" },
            notes: { notNull: false, dataType: "string" }
        }
    };
    var ep_review1 = {
        name: 'ep_review',
        columns: {
            id: { primaryKey: true, autoIncrement: true },
            index_key: { notNull: true, dataType: "number" },
            type: { notNull: true, dataType: "string" },
            language: { notNull: true, dataType: "string" },
            review: { notNull: false, dataType: "string" },
            notes: { notNull: false, dataType: "string" }
        }
    };
    var database = {
        name: dbName,
        tables: [sounds_review1, conversation_review1, ep_review1]
    };
    return database;
}

angular.module('myApp', [
    'myApp.filters',
    'myApp.controllers',
    'myApp.reorderingCtrl',
    'myApp.memoryCtrl',
    'myApp.dragMatchCtrl',
    'myApp.dectation',
    'myApp.Odd1Out_Ctrl',
    'myApp.stressCtrl',
    'myApp.Sound_Spelling_Ctrl',
    'myApp.Snap_Ctrl',
    'ngAnimate',
    'ngDragDrop'
]);

function random_gen_arr(_size) {
    var arr = new Array();
    for (var i = 0; i < _size; i++) {
        arr[i] = i;
    }
    return arr;
}

var sound = null; //new AudioPlayerClass();

angular.module('myApp.controllers', ['ngAnimate']).controller('myCtrl', function($scope, $http, $rootScope, $interval) {
    //init
    //pages
    $rootScope.reload = function($event) {
        /*$templateCache.remove($scope.exercise_tpl_arr[$scope.exerceise_counter]);
         $route.reload();*/
        $scope.exercise_tpl.url = 'partials/blank.html';
        setTimeout(function() {
            $scope.exercise_tpl.url = $scope.exercise_tpl_arr[$scope.exerceise_counter];
            $('.titleContainer').trigger('click');
        }, 400);
    };
    $rootScope.mainAns = true;
    $rootScope.left_menu = true;
    $rootScope.score = 0;
    $rootScope.totalScore = 0;
    $rootScope.start_recorder = true;
    $rootScope.audio_obj = new Audio();

    $scope.quit = function() {

        if ($rootScope.snap_stop) {
            clearInterval($rootScope.snap_stop);
        }
        if ($rootScope.timerInt) {
            clearInterval($rootScope.timerInt);
        }
        if ($rootScope.memery_match_timer) {
            clearInterval($rootScope.memery_match_timer);
        }
        if ($rootScope.reorder_timer) {
            clearInterval($rootScope.reorder_timer);
        }
        if ($rootScope.flip_card_timer) {
            clearInterval($rootScope.flip_card_timer);
        }
        if (typeof(stop) != "undefined") {
            if (stop) {
                clearInterval(stop);
            }
        }

        setTimeout(function() {
            if (!$('.reviewC').hasClass('selected')) {
                $('.accordion_content.review').prev().trigger('click');
            }
        }, 200);

        //$('.disabler').show();
        $('.actContainer').addClass('pe-none');
        $('.popupC').fadeOut();
        $('.tpl_btn').attr('disabled', true);
        //$interval.cancel(stop);
        $scope.cal_percentage();
        $scope.get_score();
    }

    //init
    //pages
    $scope.help_btn_txt = 'Help';
    $scope.sound_var = true;
    $scope.sound2_var = true;
    $scope.ex_var = true;
    $scope.ex2_var = true;
    $scope.con_var = true;
    $scope.con2_var = true;
    $scope.com_table1 = true;
    $scope.com_table1 = true;
    $scope.com_table2 = false;
    $scope.exam_var = true;
    $scope.exam2_var = true;
    $scope.info_text = true;
    $scope.home_var = false;



    //ng-include
    $scope.con_page2_html = 'partials/con_page2.html';
    $scope.sound_page2_html = 'partials/sound_page2.html';
    $scope.ex_page2_html = 'partials/ex_page2.html';
    $scope.exam_page2_html = 'partials/exam_page2.html';
    //end ng-include

    //$scope.key = '';
    //$scope.index = 0;
    //$scope.lang = '';
    $scope.colors = ["#E8BCC1", "#C5DBF4", "#FFF7B4", "#B6CD72", "#F2D4A6", "#DBDED8"];
    $scope.bootstrapcolors = ["bg-primary text-bg-primary", "bg-success text-bg-success", "bg-danger text-bg-danger", "bg-warning text-bg-warning", "bg-info text-bg-info", "bg-secondary text-bg-secondary"];
    $scope.review_color = ["var(--bs-primary)", "var(--bs-success)", "var(--bs-warning)", "var(--bs-danger)"];
    $scope.study_checkbox = new Array();
    $scope.conversation_review_arr = new Array();
    $scope.ep_review_arr = new Array();
    $scope.ep_lang = '1';
    //$scope.hoverEdit = true;
    //end pages

    //components
    $scope.dropdown = true;
    $scope.left_menu = true;
    $scope.current_section = '';
    //end components
    //init

    $scope.exerceise_counter = 0;
    $scope.exercise_tpl = {};
    $scope.exercise_tpl_arr = ['partials/stress.html', 'partials/re_ordering.html', 'partials/dectation.html', 'partials/odd_one_out.html', 'partials/drag_match.html', 'partials/sound_spelling.html', 'partials/snap.html', 'partials/memory.html']; //drag_match
    //$scope.exercise_tpl.url = $scope.exercise_tpl_arr[$scope.exerceise_counter];
    $scope.change_ex_tpl = function() {
        //$scope.exerceise_counter++;
        clearInterval($rootScope.timerInt);
        $rootScope.cnt++;
        $scope.exercise_tpl.url = 'partials/blank.html';
        setTimeout(function() {
            $scope.exercise_tpl.url = $scope.exercise_tpl.url_;
            $('.main_wrapper').trigger('click');
        }, 200);
        $scope.cal_percentage();
        $scope.get_score();
    };

    $scope.get_score = function() {
        $('.score_ele').text('You have answered ' + $rootScope.score + ' out of ' + $rootScope.totalScore + ' correctly.');
    };

    function hidel_elem() {
        $scope.sound_var = true;
        $scope.sound2_var = true;
        $scope.home_var = true;
        $scope.ex_var = true;
        $scope.ex2_var = true;
        $scope.con_var = true;
        $scope.com_table1 = true;
        $scope.com_table2 = false;
        $scope.con2_var = true;
        $scope.exam_var = true;
        $scope.exam2_var = true;
    }

    $(window).resize(function() {
        con_table();
        setTimeout(function() {
            $('.ul_cls_oddOut').css('width', ($('.li_cls').width() * 2 + 15) + 'px');
            $('.ul_cls_oddOut').css('opacity', '1');
        }, 500);
    });


    //check database

    $http.get('json/database.json').then(function(response) {
        var data = response.data;
        $rootScope.database_status = data;
    });
    $http.get('json/conversation_database.json').then(function(response) {
        var data = response.data;
        $rootScope.conversation_database = data;
    });
    $http.get('json/ep_database.json').then(function(response) {
        var data = response.data;
        $rootScope.ep_database = data;
    });


    //sounds data
    $http.get('json/sounds_data.json').then(function(response) {
        var data = response.data;
        $scope.sounds_data = data;


        var sound_cnt = 0;
        for (var i in $scope.sounds_data['consonants']) {
            if ($scope.sounds_data['consonants'][i]['b_s'] == 'yes') {

                $scope.sounds_data['consonants'][i]['b'][0]['video3'] = '';
                $scope.sounds_data['consonants'][i]['b'][0]['video4'] = '';
                $scope.sounds_data['consonants'][i]['b'][0]['video5'] = '';

                if (typeof($scope.sounds_data['consonants_b'][sound_cnt]) !== 'undefined') {
                    $scope.sounds_data['consonants'][i]['b'][0]['video1'] = $scope.sounds_data['consonants_b'][sound_cnt].value;
                    sound_cnt++;
                }
                if (typeof($scope.sounds_data['consonants_b'][sound_cnt]) !== 'undefined') {
                    $scope.sounds_data['consonants'][i]['b'][0]['video2'] = $scope.sounds_data['consonants_b'][sound_cnt].value;
                    sound_cnt++;
                }
                if (typeof($scope.sounds_data['consonants_b'][sound_cnt]) !== 'undefined') {
                    if ($scope.sounds_data['consonants'][i]['b'][0]['initial'] != '') {
                        $scope.sounds_data['consonants'][i]['b'][0]['video3'] = $scope.sounds_data['consonants_b'][sound_cnt].value;
                        sound_cnt++;
                    }
                }
                if (typeof($scope.sounds_data['consonants_b'][sound_cnt]) !== 'undefined') {
                    if ($scope.sounds_data['consonants'][i]['b'][0]['medial'] != '') {
                        $scope.sounds_data['consonants'][i]['b'][0]['video4'] = $scope.sounds_data['consonants_b'][sound_cnt].value;
                        sound_cnt++;
                    }
                }
                if (typeof($scope.sounds_data['consonants_b'][sound_cnt]) !== 'undefined') {
                    if ($scope.sounds_data['consonants'][i]['b'][0]['final'] != '') {
                        $scope.sounds_data['consonants'][i]['b'][0]['video5'] = $scope.sounds_data['consonants_b'][sound_cnt].value;
                        sound_cnt++;
                    }
                }
            }
        }
        sound_cnt = 0;
        for (var i in $scope.sounds_data['consonants']) {
            if ($scope.sounds_data['consonants'][i]['a_s'] == 'yes') {

                $scope.sounds_data['consonants'][i]['a'][0]['video3'] = '';
                $scope.sounds_data['consonants'][i]['a'][0]['video4'] = '';
                $scope.sounds_data['consonants'][i]['a'][0]['video5'] = '';

                if (typeof($scope.sounds_data['consonants_a'][sound_cnt]) !== 'undefined') {
                    $scope.sounds_data['consonants'][i]['a'][0]['video1'] = $scope.sounds_data['consonants_a'][sound_cnt].value;
                    sound_cnt++;
                }
                if (typeof($scope.sounds_data['consonants_a'][sound_cnt]) !== 'undefined') {
                    $scope.sounds_data['consonants'][i]['a'][0]['video2'] = $scope.sounds_data['consonants_a'][sound_cnt].value;
                    sound_cnt++;
                }
                if (typeof($scope.sounds_data['consonants_a'][sound_cnt]) !== 'undefined') {
                    if ($scope.sounds_data['consonants'][i]['a'][0]['initial'] != '') {
                        $scope.sounds_data['consonants'][i]['a'][0]['video3'] = $scope.sounds_data['consonants_a'][sound_cnt].value;
                        sound_cnt++;
                    }
                }
                if (typeof($scope.sounds_data['consonants_a'][sound_cnt]) !== 'undefined') {
                    if ($scope.sounds_data['consonants'][i]['a'][0]['medial'] != '') {
                        $scope.sounds_data['consonants'][i]['a'][0]['video4'] = $scope.sounds_data['consonants_a'][sound_cnt].value;
                        sound_cnt++;
                    }
                }
                if (typeof($scope.sounds_data['consonants_a'][sound_cnt]) !== 'undefined') {
                    if ($scope.sounds_data['consonants'][i]['a'][0]['final'] != '') {
                        $scope.sounds_data['consonants'][i]['a'][0]['video5'] = $scope.sounds_data['consonants_a'][sound_cnt].value;
                        sound_cnt++;
                    }
                }
            }
        }

        //vowels
        sound_cnt = 0;
        for (var i in $scope.sounds_data['vowels_n_diphthongs']) {
            if ($scope.sounds_data['vowels_n_diphthongs'][i]['b_s'] == 'yes') {

                $scope.sounds_data['vowels_n_diphthongs'][i]['b'][0]['video3'] = '';
                $scope.sounds_data['vowels_n_diphthongs'][i]['b'][0]['video4'] = '';
                $scope.sounds_data['vowels_n_diphthongs'][i]['b'][0]['video5'] = '';

                if (typeof($scope.sounds_data['vowels_b'][sound_cnt]) !== 'undefined') {
                    $scope.sounds_data['vowels_n_diphthongs'][i]['b'][0]['video1'] = $scope.sounds_data['vowels_b'][sound_cnt].value;
                    sound_cnt++;
                }
                if (typeof($scope.sounds_data['vowels_b'][sound_cnt]) !== 'undefined') {
                    $scope.sounds_data['vowels_n_diphthongs'][i]['b'][0]['video2'] = $scope.sounds_data['vowels_b'][sound_cnt].value;
                    sound_cnt++;
                }
                if (typeof($scope.sounds_data['vowels_b'][sound_cnt]) !== 'undefined') {
                    if ($scope.sounds_data['vowels_n_diphthongs'][i]['b'][0]['initial'] != '') {
                        $scope.sounds_data['vowels_n_diphthongs'][i]['b'][0]['video3'] = $scope.sounds_data['vowels_b'][sound_cnt].value;
                        sound_cnt++;
                    }
                }
                if (typeof($scope.sounds_data['vowels_b'][sound_cnt]) !== 'undefined') {
                    if ($scope.sounds_data['vowels_n_diphthongs'][i]['b'][0]['medial'] != '') {
                        $scope.sounds_data['vowels_n_diphthongs'][i]['b'][0]['video4'] = $scope.sounds_data['vowels_b'][sound_cnt].value;
                        sound_cnt++;
                    }
                }
                if (typeof($scope.sounds_data['vowels_b'][sound_cnt]) !== 'undefined') {
                    if ($scope.sounds_data['vowels_n_diphthongs'][i]['b'][0]['final'] != '') {
                        $scope.sounds_data['vowels_n_diphthongs'][i]['b'][0]['video5'] = $scope.sounds_data['vowels_b'][sound_cnt].value;
                        sound_cnt++;
                    }
                }
            }
        }

        sound_cnt = 0;
        for (var i in $scope.sounds_data['vowels_n_diphthongs']) {
            if ($scope.sounds_data['vowels_n_diphthongs'][i]['a_s'] == 'yes') {

                $scope.sounds_data['vowels_n_diphthongs'][i]['a'][0]['video3'] = '';
                $scope.sounds_data['vowels_n_diphthongs'][i]['a'][0]['video4'] = '';
                $scope.sounds_data['vowels_n_diphthongs'][i]['a'][0]['video5'] = '';

                if (typeof($scope.sounds_data['vowels_a'][sound_cnt]) !== 'undefined') {
                    $scope.sounds_data['vowels_n_diphthongs'][i]['a'][0]['video1'] = $scope.sounds_data['vowels_a'][sound_cnt].value;
                    sound_cnt++;
                }
                if (typeof($scope.sounds_data['vowels_a'][sound_cnt]) !== 'undefined') {
                    $scope.sounds_data['vowels_n_diphthongs'][i]['a'][0]['video2'] = $scope.sounds_data['vowels_a'][sound_cnt].value;
                    sound_cnt++;
                }
                if (typeof($scope.sounds_data['vowels_a'][sound_cnt]) !== 'undefined') {
                    if ($scope.sounds_data['vowels_n_diphthongs'][i]['a'][0]['initial'] != '') {
                        $scope.sounds_data['vowels_n_diphthongs'][i]['a'][0]['video3'] = $scope.sounds_data['vowels_a'][sound_cnt].value;
                        sound_cnt++;
                    }
                }
                if (typeof($scope.sounds_data['vowels_a'][sound_cnt]) !== 'undefined') {
                    if ($scope.sounds_data['vowels_n_diphthongs'][i]['a'][0]['medial'] != '') {
                        $scope.sounds_data['vowels_n_diphthongs'][i]['a'][0]['video4'] = $scope.sounds_data['vowels_a'][sound_cnt].value;
                        sound_cnt++;
                    }
                }
                if (typeof($scope.sounds_data['vowels_a'][sound_cnt]) !== 'undefined') {
                    if ($scope.sounds_data['vowels_n_diphthongs'][i]['a'][0]['final'] != '') {
                        $scope.sounds_data['vowels_n_diphthongs'][i]['a'][0]['video5'] = $scope.sounds_data['vowels_a'][sound_cnt].value;
                        sound_cnt++;
                    }
                }
            }
        }

    });
    //end sounds data

    //conversations data
    $http.get('json/con_data.json').then(function(response) {
        var data = response.data;
        $scope.con_data = data;

        //add audio files
        var con_p_cnt = 0;
        for (var i in $scope.con_data.function1) {
            var shortname = $scope.con_data.function1[i]['short_name'];
            shortname = shortname.replace(/ /g, "_");
            shortname = shortname.toLowerCase();

            //video
            $scope.con_data.function1[i]['video'] = 'OALD9_US_dialogues_' + (con_p_cnt + 1);
            con_p_cnt++;
            //end video
            $scope.con_data.function1[i].b[0]['audio'] = new Array();

            var audio_cnt = 0;
            for (var k in $scope.con_data.function1[i].b[0]['left_list']) {
                $scope.con_data.function1[i].b[0]['audio'][k] = new Array();
                for (var j in $scope.con_data.function1[i].b[0]['left_list'][k]) {

                    $scope.con_data.function1[i].b[0]['audio'][k][j] = 'ispeaker_everyday_' + shortname + '_' + (audio_cnt + 1) + '_gb';
                    audio_cnt++;
                }
            }

            $scope.con_data.function1[i].a[0]['audio'] = new Array();
            audio_cnt = 0;
            for (var k in $scope.con_data.function1[i].a[0]['left_list']) {
                $scope.con_data.function1[i].a[0]['audio'][k] = new Array();
                for (var j in $scope.con_data.function1[i].a[0]['left_list'][k]) {

                    $scope.con_data.function1[i].a[0]['audio'][k][j] = 'ispeaker_everyday_' + shortname + '_' + (audio_cnt + 1) + '_us';
                    audio_cnt++;
                }
            }
        }
        for (var i in $scope.con_data.function2) {
            var shortname = $scope.con_data.function2[i]['short_name'];
            shortname = shortname.replace(/ /g, "_");
            shortname = shortname.toLowerCase();

            //video
            $scope.con_data.function2[i]['video'] = 'OALD9_US_dialogues_' + (con_p_cnt + 1);
            con_p_cnt++;
            //end video

            $scope.con_data.function2[i].b[0]['audio'] = new Array();

            var audio_cnt = 0;
            for (var k in $scope.con_data.function2[i].b[0]['left_list']) {
                $scope.con_data.function2[i].b[0]['audio'][k] = new Array();
                for (var j in $scope.con_data.function2[i].b[0]['left_list'][k]) {

                    $scope.con_data.function2[i].b[0]['audio'][k][j] = 'ispeaker_everyday_' + shortname + '_' + (audio_cnt + 1) + '_gb';
                    audio_cnt++;
                }
            }

            $scope.con_data.function2[i].a[0]['audio'] = new Array();
            audio_cnt = 0;
            for (var k in $scope.con_data.function2[i].a[0]['left_list']) {
                $scope.con_data.function2[i].a[0]['audio'][k] = new Array();
                for (var j in $scope.con_data.function2[i].a[0]['left_list'][k]) {

                    $scope.con_data.function2[i].a[0]['audio'][k][j] = 'ispeaker_everyday_' + shortname + '_' + (audio_cnt + 1) + '_us';
                    audio_cnt++;
                }
            }
        }

        //audio for right side
        var cnt_b = 1; //en
        var cnt_a = 1; //en

        for (var i in $scope.con_data['function1']) {
            $scope.con_data.function1[i]['b'][0]['audios'] = new Array();
            $scope.con_data.function1[i]['a'][0]['audios'] = new Array();
            var temp_i = i;
            temp_i++;
            for (var k in $scope.con_data['function1'][i]['b'][0]['study']) {
                var name = $scope.con_data['function1'][i]['function'].toLowerCase();
                name = name.replace(/ /g, "_");
                //for british
                var audio_file_name = 'ispeaker_video_' + zeroPad(temp_i, 2) + '_' + name + '_gb_' + cnt_b;
                $scope.con_data['function1'][i]['b'][0]['audios'].push(audio_file_name);
                cnt_b++;
            }
            var study_custom = false;
            var study_key = 'study';
            if (typeof($scope.con_data['function1'][i]['a'][0]['study_custom']) != 'undefined') {
                study_key = 'study_custom';
            }

            for (var k in $scope.con_data['function1'][i]['a'][0][study_key]) {
                name = $scope.con_data['function1'][i]['function'].toLowerCase();
                name = name.replace(/ /g, "_");

                audio_file_name = 'ispeaker_video_' + zeroPad(temp_i, 2) + '_' + name + '_us_' + cnt_a;
                $scope.con_data['function1'][i]['a'][0]['audios'].push(audio_file_name);
                cnt_a++;
            }
        }
        for (var i in $scope.con_data['function2']) {
            $scope.con_data.function2[i]['b'][0]['audios'] = new Array();
            $scope.con_data.function2[i]['a'][0]['audios'] = new Array();
            temp_i = i;
            temp_i++;

            temp_i = temp_i + Number($scope.con_data['function1'].length);
            study_custom = false;
            study_key = 'study';
            if (typeof($scope.con_data['function2'][i]['b'][0]['study_custom']) != 'undefined') {
                study_key = 'study_custom';
            }
            for (var k in $scope.con_data['function2'][i]['b'][0][study_key]) {
                name = $scope.con_data['function2'][i]['function'].toLowerCase();
                name = name.replace(/ /g, "_");
                //for british
                audio_file_name = 'ispeaker_video_' + zeroPad(temp_i, 2) + '_' + name + '_gb_' + cnt_b;
                $scope.con_data['function2'][i]['b'][0]['audios'].push(audio_file_name);
                cnt_b++;
            }
            study_custom = false;
            study_key = 'study';
            if (typeof($scope.con_data['function2'][i]['a'][0]['study_custom']) != 'undefined') {
                study_key = 'study_custom';
            }
            for (var k in $scope.con_data['function2'][i]['a'][0][study_key]) {

                name = $scope.con_data['function2'][i]['function'].toLowerCase();
                name = name.replace(/ /g, "_");

                audio_file_name = 'ispeaker_video_' + zeroPad(temp_i, 2) + '_' + name + '_us_' + cnt_a;
                $scope.con_data['function2'][i]['a'][0]['audios'].push(audio_file_name);
                cnt_a++;
            }

        }
        console.log($scope.con_data);
        //end audio for right side

        //end add audio files
    });
    //end conversations data

    //exam data
    $http.get('json/exam_data.json').then(function(response) {var data = response.data;
        $scope.exam_data = data;

        for (var i in $scope.exam_data['task']) {
            var shortname = $scope.exam_data['task'][i]['short_name'];
            shortname = shortname.replace(/ /g, "_");
            shortname = shortname.toLowerCase();


            var audio_cnt = 0;
            $scope.exam_data['task'][i]['audio'] = new Array();
            for (var k in $scope.exam_data['task'][i]['left_list']) {
                $scope.exam_data['task'][i]['audio'][k] = new Array();
                for (var j in $scope.exam_data['task'][i]['left_list'][k]) {
                    if ($scope.exam_data['task'][i]['left_list'][k][i] == '') {
                        audio_cnt++;
                    } else {
                        $scope.exam_data['task'][i]['audio'][k][j] = 'ispeaker_exam_' + shortname + '_' + (audio_cnt + 1) + '_gb';
                        audio_cnt++;
                    }

                }
            }
        }
    });
    //end exam data


    //exercise data
    $rootScope.ex_data = {};




    $http.get('json/sounds_n_spelling.json').then(function(response) {var data = response.data;
        $rootScope.ex_data['sounds_n_spelling'] = data.sounds_n_spelling;

        var sec_arr = new Array();
        var data_b = new Array();
        var data_a = new Array();
        for (var i = 0; i < ($rootScope.ex_data['sounds_n_spelling'].length - 1); i++) {
            if ($rootScope.ex_data['sounds_n_spelling'][i]['b_s'] == 'yes') {
                sec_arr[i] = random_gen_arr($rootScope.ex_data['sounds_n_spelling'][i]["b"][0]['act'].length);
            } else {
                sec_arr[i] = random_gen_arr($rootScope.ex_data['sounds_n_spelling'][i]["a"][0]['act'].length);
            }
            sec_arr[i] = shuffleArray(sec_arr[i].slice(0));
        }

        var ss_cnt_b = 0;
        var ss_cnt_a = 0;
        for (var i = 0; i < ($rootScope.ex_data['sounds_n_spelling'].length - 1); i++) {
            if ($rootScope.ex_data['sounds_n_spelling'][i]['b_s'] == 'yes') {
                for (var k = 0; k < 6; k++) {
                    data_b[ss_cnt_b] = $rootScope.ex_data['sounds_n_spelling'][i]["b"][0]['act'][sec_arr[i][k]];
                    ss_cnt_b++;
                }
            }
            if ($rootScope.ex_data['sounds_n_spelling'][i]['a_s'] == 'yes') {
                for (var k = 0; k < 6; k++) {
                    data_a[ss_cnt_a] = $rootScope.ex_data['sounds_n_spelling'][i]["a"][0]['act'][sec_arr[i][k]];
                    ss_cnt_a++;
                }
            }
        }
        var final_arr_b = shuffleArray(data_b.slice(0));
        var final_arr_a = shuffleArray(data_a.slice(0));

        $rootScope.ex_data['sounds_n_spelling'][13]["b"][0]['act'] = final_arr_b.slice(0);
        $rootScope.ex_data['sounds_n_spelling'][13]["a"][0]['act'] = final_arr_a.slice(0);



    });

    $http.get('json/snap.json').then(function(response) {var data = response.data;

        $rootScope.ex_data['snap'] = data.snap;

        //for snap random temp
        var sec1_arr = random_gen_arr($rootScope.ex_data['snap'][0]["b"][0]['act'].length);
        var sec2_arr = random_gen_arr($rootScope.ex_data['snap'][1]["b"][0]['act'].length);


        var dict_data_b = new Array();
        var dict_data_a = new Array();
        var final_arr_b = new Array();
        var final_arr_a = new Array();
        var cnt_ = 0;

        sec1_arr = shuffleArray(sec1_arr.slice(0));
        sec2_arr = shuffleArray(sec2_arr.slice(0));


        for (var i = 0; i < 50; i++) { //Words
            dict_data_b[cnt_] = $rootScope.ex_data['snap'][0]["b"][0]['act'][sec1_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['snap'][0]["a"][0]['act'][sec1_arr[i]];
            cnt_++;
        }
        for (var i = 0; i < 50; i++) { //Sentences
            dict_data_b[cnt_] = $rootScope.ex_data['snap'][1]["b"][0]['act'][sec2_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['snap'][1]["a"][0]['act'][sec2_arr[i]];
            cnt_++;
        }

        final_arr_b = shuffleArray(dict_data_b.slice(0));
        final_arr_a = shuffleArray(dict_data_a.slice(0));

        $rootScope.ex_data['snap'][2]["b"][0]['act'] = final_arr_b.slice(0);
        $rootScope.ex_data['snap'][2]["a"][0]['act'] = final_arr_a.slice(0);

        //end for snap random temp

    });

    $http.get('json/sorting.json').then(function(response) {var data = response.data;
        $rootScope.ex_data['sorting'] = data.sorting;

        //for dictation random temp
        var sec1_arr = random_gen_arr($rootScope.ex_data['sorting'][0]["b"][0]['act'].length);
        var sec2_arr = random_gen_arr($rootScope.ex_data['sorting'][1]["b"][0]['act'].length);
        var sec3_arr = random_gen_arr($rootScope.ex_data['sorting'][2]["b"][0]['act'].length);

        var dict_data_b = new Array();
        var dict_data_a = new Array();
        var final_arr_b = new Array();
        var final_arr_a = new Array();
        var cnt_ = 0;

        sec1_arr = shuffleArray(sec1_arr.slice(0));
        sec2_arr = shuffleArray(sec2_arr.slice(0));
        sec3_arr = shuffleArray(sec3_arr.slice(0));

        for (var i = 0; i < 5; i++) { //for words
            dict_data_b[cnt_] = $rootScope.ex_data['sorting'][0]["b"][0]['act'][sec1_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['sorting'][0]["a"][0]['act'][sec1_arr[i]];
            cnt_++;
        }
        for (var i = 0; i < 5; i++) { //for Missing words
            dict_data_b[cnt_] = $rootScope.ex_data['sorting'][1]["b"][0]['act'][sec2_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['sorting'][1]["a"][0]['act'][sec2_arr[i]];
            cnt_++;
        }
        for (var i = 0; i < 5; i++) { //for Sentences
            dict_data_b[cnt_] = $rootScope.ex_data['sorting'][2]["b"][0]['act'][sec3_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['sorting'][2]["a"][0]['act'][sec3_arr[i]];
            cnt_++;
        }

        final_arr_b = shuffleArray(dict_data_b.slice(0));
        final_arr_a = shuffleArray(dict_data_a.slice(0));

        $rootScope.ex_data['sorting'][3]["b"][0]['act'] = final_arr_b.slice(0);
        $rootScope.ex_data['sorting'][3]["a"][0]['act'] = final_arr_a.slice(0);
        //end for for dictation random temp

    });

    $http.get('json/dictation.json').then(function(response) {var data = response.data;
        $rootScope.ex_data['dictation'] = data.dictation;

        //for dictation random temp
        var sec1_arr = random_gen_arr($rootScope.ex_data['dictation'][0]["b"][0]['act'].length);
        var sec2_arr = random_gen_arr($rootScope.ex_data['dictation'][1]["b"][0]['act'].length);
        var sec3_arr = random_gen_arr($rootScope.ex_data['dictation'][2]["b"][0]['act'].length);

        var dict_data_b = new Array();
        var dict_data_a = new Array();
        var final_arr_b = new Array();
        var final_arr_a = new Array();
        var cnt_ = 0;

        sec1_arr = shuffleArray(sec1_arr.slice(0));
        sec2_arr = shuffleArray(sec2_arr.slice(0));
        sec3_arr = shuffleArray(sec3_arr.slice(0));

        for (var i = 0; i < 50; i++) { //for words
            dict_data_b[cnt_] = $rootScope.ex_data['dictation'][0]["b"][0]['act'][sec1_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['dictation'][0]["a"][0]['act'][sec1_arr[i]];
            cnt_++;
        }
        for (var i = 0; i < 35; i++) { //for Missing words
            dict_data_b[cnt_] = $rootScope.ex_data['dictation'][1]["b"][0]['act'][sec2_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['dictation'][1]["a"][0]['act'][sec2_arr[i]];
            cnt_++;
        }
        for (var i = 0; i < 35; i++) { //for Sentences
            dict_data_b[cnt_] = $rootScope.ex_data['dictation'][2]["b"][0]['act'][sec3_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['dictation'][2]["a"][0]['act'][sec3_arr[i]];
            cnt_++;
        }

        final_arr_b = shuffleArray(dict_data_b.slice(0));
        final_arr_a = shuffleArray(dict_data_a.slice(0));

        $rootScope.ex_data['dictation'][3]["b"][0]['act'] = final_arr_b.slice(0);
        $rootScope.ex_data['dictation'][3]["a"][0]['act'] = final_arr_a.slice(0);
        //end for for dictation random temp



    });

    $http.get('json/matchup.json').then(function(response) {var data = response.data;
        $rootScope.ex_data['matchup'] = data.matchup;

        //for match random temp
        var sec1_arr = random_gen_arr($rootScope.ex_data['matchup'][0]["b"][0]['act'].length);
        var sec2_arr = random_gen_arr($rootScope.ex_data['matchup'][1]["b"][0]['act'].length);
        var sec3_arr = random_gen_arr($rootScope.ex_data['matchup'][2]["b"][0]['act'].length);

        var dict_data_b = new Array();
        var dict_data_a = new Array();
        var final_arr_b = new Array();
        var final_arr_a = new Array();
        var cnt_ = 0;

        sec1_arr = shuffleArray(sec1_arr.slice(0));
        sec2_arr = shuffleArray(sec2_arr.slice(0));
        sec3_arr = shuffleArray(sec3_arr.slice(0));

        for (var i = 0; i < 15; i++) { //Similar sounds
            dict_data_b[cnt_] = $rootScope.ex_data['matchup'][0]["b"][0]['act'][sec1_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['matchup'][0]["a"][0]['act'][sec1_arr[i]];
            cnt_++;
        }
        for (var i = 0; i < 15; i++) { //Reading phonetics
            dict_data_b[cnt_] = $rootScope.ex_data['matchup'][1]["b"][0]['act'][sec2_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['matchup'][1]["a"][0]['act'][sec2_arr[i]];
            cnt_++;
        }
        for (var i = 0; i < 10; i++) { //Comprehension
            dict_data_b[cnt_] = $rootScope.ex_data['matchup'][2]["b"][0]['act'][sec3_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['matchup'][2]["a"][0]['act'][sec3_arr[i]];
            cnt_++;
        }

        final_arr_b = shuffleArray(dict_data_b.slice(0));
        final_arr_a = shuffleArray(dict_data_a.slice(0));

        $rootScope.ex_data['matchup'][3]["b"][0]['act'] = final_arr_b.slice(0);
        $rootScope.ex_data['matchup'][3]["a"][0]['act'] = final_arr_a.slice(0);

        //random original

        //end for for match random temp
    });

    $http.get('json/reordering.json').then(function(response) {var data = response.data;
        $rootScope.ex_data['reordering'] = data.reordering;

        //for reordering random temp
        var sec1_arr = random_gen_arr($rootScope.ex_data['reordering'][0]["b"][0]['act'].length);
        var sec2_arr = random_gen_arr($rootScope.ex_data['reordering'][1]["b"][0]['act'].length);


        var dict_data_b = new Array();
        var dict_data_a = new Array();
        var final_arr_b = new Array();
        var final_arr_a = new Array();
        var cnt_ = 0;

        sec1_arr = shuffleArray(sec1_arr.slice(0));
        sec2_arr = shuffleArray(sec2_arr.slice(0));


        for (var i = 0; i < 75; i++) { //Words
            dict_data_b[cnt_] = $rootScope.ex_data['reordering'][0]["b"][0]['act'][sec1_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['reordering'][0]["a"][0]['act'][sec1_arr[i]];
            cnt_++;
        }
        for (var i = 0; i < 50; i++) { //Sentences
            dict_data_b[cnt_] = $rootScope.ex_data['reordering'][1]["b"][0]['act'][sec2_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['reordering'][1]["a"][0]['act'][sec2_arr[i]];
            cnt_++;
        }

        final_arr_b = shuffleArray(dict_data_b.slice(0));
        final_arr_a = shuffleArray(dict_data_a.slice(0));

        $rootScope.ex_data['reordering'][2]["b"][0]['act'] = final_arr_b.slice(0);
        $rootScope.ex_data['reordering'][2]["a"][0]['act'] = final_arr_a.slice(0);

        //end for reordering random temp
    });

    $http.get('json/memory_match.json').then(function(response) {var data = response.data;
        $rootScope.ex_data['memory_match'] = data.memory_match;

        //for memory match random temp
        var sec1_arr = random_gen_arr($rootScope.ex_data['memory_match'][0]["b"][0]['act'].length);
        var sec2_arr = random_gen_arr($rootScope.ex_data['memory_match'][1]["b"][0]['act'].length);


        var dict_data_b = new Array();
        var dict_data_a = new Array();
        var final_arr_b = new Array();
        var final_arr_a = new Array();
        var cnt_ = 0;

        sec1_arr = shuffleArray(sec1_arr.slice(0));
        sec2_arr = shuffleArray(sec2_arr.slice(0));


        for (var i = 0; i < 5; i++) { //Words
            dict_data_b[cnt_] = $rootScope.ex_data['memory_match'][0]["b"][0]['act'][sec1_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['memory_match'][0]["a"][0]['act'][sec1_arr[i]];
            cnt_++;
        }
        for (var i = 0; i < 5; i++) { //Sentences
            dict_data_b[cnt_] = $rootScope.ex_data['memory_match'][1]["b"][0]['act'][sec2_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['memory_match'][1]["a"][0]['act'][sec2_arr[i]];
            cnt_++;
        }

        final_arr_b = shuffleArray(dict_data_b.slice(0));
        final_arr_a = shuffleArray(dict_data_a.slice(0));

        $rootScope.ex_data['memory_match'][2]["b"][0]['act'] = final_arr_b.slice(0);
        $rootScope.ex_data['memory_match'][2]["a"][0]['act'] = final_arr_a.slice(0);


        //end for memory match random temp
    });

    $http.get('json/odd_one_out.json').then(function(response) {var data = response.data;
        $rootScope.ex_data['odd_one_out'] = data.odd_one_out;

        //for odd 1 out random temp
        $rootScope.ex_data['odd_one_out'][0]["a"][0]['act'] = $rootScope.ex_data['odd_one_out'][0]["b"][0]['act'].slice(0);
        $rootScope.ex_data['odd_one_out'][1]["a"][0]['act'] = $rootScope.ex_data['odd_one_out'][1]["b"][0]['act'].slice(0);
        $rootScope.ex_data['odd_one_out'][2]["a"][0]['act'] = $rootScope.ex_data['odd_one_out'][2]["b"][0]['act'].slice(0);



        var sec1_arr = random_gen_arr($rootScope.ex_data['odd_one_out'][0]["b"][0]['act'].length);
        var sec2_arr = random_gen_arr($rootScope.ex_data['odd_one_out'][1]["b"][0]['act'].length);
        var sec3_arr = random_gen_arr($rootScope.ex_data['odd_one_out'][2]["b"][0]['act'].length);

        var dict_data_b = new Array();
        var dict_data_a = new Array();
        var final_arr_b = new Array();
        var final_arr_a = new Array();
        var cnt_ = 0;

        sec1_arr = shuffleArray(sec1_arr.slice(0));
        sec2_arr = shuffleArray(sec2_arr.slice(0));
        sec3_arr = shuffleArray(sec3_arr.slice(0));

        for (var i = 0; i < 15; i++) { //Similar sounds
            dict_data_b[cnt_] = $rootScope.ex_data['odd_one_out'][0]["b"][0]['act'][sec1_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['odd_one_out'][0]["a"][0]['act'][sec1_arr[i]];
            cnt_++;
        }
        for (var i = 0; i < 15; i++) { //Reading phonetics
            dict_data_b[cnt_] = $rootScope.ex_data['odd_one_out'][1]["b"][0]['act'][sec2_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['odd_one_out'][1]["a"][0]['act'][sec2_arr[i]];
            cnt_++;
        }
        for (var i = 0; i < 20; i++) { //Comprehension
            dict_data_b[cnt_] = $rootScope.ex_data['odd_one_out'][2]["b"][0]['act'][sec3_arr[i]];
            dict_data_a[cnt_] = $rootScope.ex_data['odd_one_out'][2]["a"][0]['act'][sec3_arr[i]];
            cnt_++;
        }

        final_arr_b = shuffleArray(dict_data_b.slice(0));
        final_arr_a = shuffleArray(dict_data_a.slice(0));

        $rootScope.ex_data['odd_one_out'][3]["b"][0]['act'] = final_arr_b.slice(0);
        $rootScope.ex_data['odd_one_out'][3]["a"][0]['act'] = final_arr_a.slice(0);

        //end odd 1 out random temp

    });

    $http.get('json/ex_data.json').then(function(response) {var data = response.data;
        //$rootScope.ex_data = data;
        //$scope.ex_data = data;
    });
    //end exercise data



    function con_table() {
        if ($(window).width() <= 927) {
            $scope.com_table1 = false;
            $scope.com_table2 = true;
        } else {
            $scope.com_table1 = true;
            $scope.com_table2 = false;
        }

        if ($(window).width() <= 480) {
            //$scope.help_btn_txt = '?';
        } else {
            $scope.help_btn_txt = 'Help';
        }
    }


    $scope.study_check = function() {
        $('#studyContainer-body').find('span[data-index]').each(function() {
            var id = $(this).attr('data-index');
            if ($scope.study_checkbox[id]) {
                //$(this).css('background-color', $scope.colors[id]).css('color', '#000000');
                $(this).addClass($scope.bootstrapcolors[id]);
            } else {
                $(this).removeClass();
            }
        });
    };


    $scope.rotate = function($event, value, index) {
        $scope.match = false;
        if ($scope.clicked && typeof $scope.clicked != 'undefined') {
            if ($scope.value == value) {
                $scope.match = true;
            }
        } else {
            $scope.clicked = index;
            $scope.value = value;
        }


        rotateDiv($event.target, 40, 90);

    };
    $scope.time = 0.60;
    if ($rootScope.flip_card_timer) {
        clearInterval($rootScope.flip_card_timer);
    }
    $rootScope.flip_card_timer = setInterval(function() {
        if ($scope.time.toFixed(2) <= 0.01) {
            //$interval.cancel(stop);
            clearInterval($rootScope.flip_card_timer);
        }
        $scope.time -= 0.01;
    }, 1000);

    //home page
    $scope.check_dropdown = function($event) {
        if (!$($event.target).hasClass('models_page_down_arrow')) {
            $scope.dropdown = true;
        }
    };
    $scope.load_section = function($event, page_id) {

        $scope.con_page2_html = 'partials/blank.html';
        $scope.sound_page2_html = 'partials/blank.html';
        $scope.ex_page2_html = 'partials/blank.html';
        $scope.exam_page2_html = 'partials/blank.html';
        window.scrollTo(0, 0);
        if (recorder) {
            recorder && recorder.stop();
            recorder.clear();
        }

        if ($rootScope.snap_stop) {
            clearInterval($rootScope.snap_stop);
        }
        if ($rootScope.timerInt) {
            clearInterval($rootScope.timerInt);
        }
        if ($rootScope.memery_match_timer) {
            clearInterval($rootScope.memery_match_timer);
        }
        if ($rootScope.reorder_timer) {
            clearInterval($rootScope.reorder_timer);
        }
        if ($rootScope.flip_card_timer) {
            clearInterval($rootScope.flip_card_timer);
        }
        if (typeof(stop) != "undefined") {
            if (stop) {
                clearInterval(stop);
            }
        }
        $scope.left_menu = true;
        if (page_id == 'home_page') {
            hidel_elem();
            $scope.home_var = false;
        }

        if (page_id == 'sound_page') {
            hidel_elem();
            $scope.sound_var = false;
            $scope.current_section = 'Sounds';
            $scope.head_h1 = 'Choose a sound to practise';

            if (!$rootScope.database_status['status']) {
                $rootScope.database_status['status'] = true;
                $scope.insert_sounds_database();
            }
                
            //IndexedDB
            async function fetchSounds() {
                var results = await connection.select({
                    from: 'sounds_review'
                })
                if (results.length !== 0) {
                    for (var i in results) {
                        $scope.sounds_data[results[i]['type']][results[i]['index_key']][results[i]['language']][0]['review'] = results[i]['review'];
                    }
                }
            }
            fetchSounds();

            setTimeout(function() {
                $('.main_wrapper').trigger('click');
            }, 300);

            //database
        }
        if (page_id == 'ex_page') {

            hidel_elem();
            $scope.ex_var = false;
            $scope.current_section = 'Exercises';
            $scope.head_h1 = 'Choose an exercise';
        }
        if (page_id == 'con_page') {
            if (!$rootScope.conversation_database['status']) {
                $rootScope.conversation_database['status'] = true;
                $scope.insert_conversation_database();
            }
            hidel_elem();

            $scope.con_var = false;
            $scope.com_table1 = true;
            $scope.com_table2 = false;
            con_table();
            $scope.current_section = 'Conversations';
            $scope.head_h1 = 'Choose a conversation';

        }

        if (page_id == 'exam_page') {
            if (!$rootScope.ep_database['status']) {
                $rootScope.ep_database['status'] = true;
                $scope.insert_ep_database();
            }
            hidel_elem();

            $scope.exam_var = false;
            $scope.current_section = 'Exam speaking';
            //$scope.left_menu = false;
            $scope.head_h1 = 'Choose a speaking task';
        }
        if (recorder) {
            recorder && recorder.stop();
            recorder.clear();
        }

        //$('html').css('overflow', 'auto');
        $scope.s_head_h1 = $scope.head_h1;
        scroll_top();

    };
    $scope.set_review = function(index_key, type, language, review) {

        //IndexedDB
        async function updateSoundsreview() {
            var update = await connection.update({
                in: 'sounds_review',
                where: {
                    index_key: Number(index_key),
                    type: type,
                    language: language
                },
                set: {
                    review: Number(review)
                }
            })
        }
        updateSoundsreview();
        $('.rating_div div').removeClass('selected');
        $('.rate_' + review).addClass('selected');


    };
    $scope.insert_sounds_database = function() {

        /*var fs = require('fs');
        fs.writeFile("./www/json/database.json", JSON.stringify({"status": true}), function(err) {
            if (err) {
                alert("Please try again");
            }
        });*/
        
        //IndexedDB
        async function checkifdataexists() {
            var results = await connection.select({
                    from: 'sounds_review',
                    where: {
                        index_key: 0
                    }
                })
                if (results.length == 0) {
                    console.log('No sounds_review data exists, creating default data');
                    async function insertconsonants_data() {
                        var insertsoundreview = await connection.insert({
                            into: "sounds_review",
                            values: [consonants_data,consonants_data1,consonants_data2,consonants_data3,consonants_data4,consonants_data5,consonants_data6,consonants_data7,consonants_data8,consonants_data9,consonants_data10,consonants_data11,consonants_data12,consonants_data13,consonants_data14,consonants_data15,consonants_data16,consonants_data17,consonants_data18,consonants_data19,consonants_data20,consonants_data21,consonants_data22,consonants_data23,consonants_data24,consonants_data25,consonants_data26,consonants_data27,consonants_data28,consonants_data29,consonants_data30,consonants_data31,consonants_data32,consonants_data33,consonants_data34,consonants_data35,consonants_data36,consonants_data37,consonants_data38,consonants_data39,consonants_data40,consonants_data41,consonants_data42,consonants_data43,consonants_data44,consonants_data45,consonants_data46,consonants_data47,consonants_data48,consonants_data49,consonants_data50,consonants_data51,consonants_data52,consonants_data53,consonants_data54,consonants_data55,consonants_data56,consonants_data57,consonants_data58,consonants_data59,consonants_data60,consonants_data61,consonants_data62,consonants_data63,consonants_data64,consonants_data65,consonants_data66,consonants_data67,consonants_data68,consonants_data69,consonants_data70,consonants_data71,consonants_data72,consonants_data73,consonants_data74,consonants_data75,consonants_data76,consonants_data77,consonants_data78,consonants_data79,consonants_data80,consonants_data81,consonants_data82,consonants_data83,consonants_data84,consonants_data85,consonants_data86,consonants_data87,consonants_data88,consonants_data89,consonants_data90,consonants_data91,consonants_data92,consonants_data93,consonants_data94,consonants_data95,consonants_data96,consonants_data97,consonants_data98,consonants_data99,consonants_data100,consonants_data101,consonants_data102,consonants_data103,consonants_data104,consonants_data105,consonants_data106,consonants_data107]
                        })
                    }
                    insertconsonants_data();
                }
        }
        checkifdataexists();
        

    };

    $scope.conversation_notes = function() {

        var index_key = $scope.index;
        var type = $scope.key;
        var language = $scope.lang;
        var notes = '';

        notes = $('.your_notes_txt').val();
        if (notes.trim() != '') {
            notes = notes.replace(/'/g, '#|#');
            notes = notes.replace(/"/g, '#||#');
        }
            
        //IndexedDB
        async function updateConversationNotes() {
            var update = await connection.update({
                in: 'conversation_review',
                where: {
                    index_key: Number(index_key),
                    type: type,
                    language: language
                },
                set: {
                    notes: notes
                }
            })
        }
        updateConversationNotes();

    };
    $scope.ep_notes = function() {
        var index_key = $scope.index;
        var type = $scope.key;
        var language = $scope.lang;
        var notes = '';
        var cnt = 0;
        $('.your_notes_txt').each(function(elem, index) {
            if (cnt == 0) {
                notes += $(this).val();
            } else {
                notes += '|==|' + $(this).val();
            }
            cnt++;
        });


        if (notes.trim() != '') {
            notes = notes.replace(/'/g, '#|#');
            notes = notes.replace(/"/g, '#||#');
        }

        //IndexedDB
        async function updateNotes_ep() {
            var update = await connection.update({
                in: 'ep_review',
                where: {
                    index_key: Number(index_key),
                    type: type,
                    language: 'b'
                },
                set: {
                    notes: notes
                }
            })
        }
        updateNotes_ep();
    };

    $scope.conversation_review = function() {
        //console.log($scope.conversation_review_arr);

        var review = '';
        var index_key = $scope.index;
        var type = $scope.key;
        var language = $scope.lang;

        for (var i in $scope.conversation_review_arr) {
            if ($scope.conversation_review_arr[i] === true) {
                review += '0';
            } else {
                review += '1';
            }
        }

        //IndexedDB
        async function updateConversationreview() {
            var update = await connection.update({
                in: 'conversation_review',
                where: {
                    index_key: Number(index_key),
                    type: type,
                    language: language
                },
                set: {
                    review: review
                }
            })
        }
        updateConversationreview();
        
    };
    $scope.insert_conversation_database = function() {
        /*var fs = require('fs');
        fs.writeFile("./www/json/conversation_database.json", JSON.stringify({"status": true}), function(err) {
            if (err) {
                alert("Please try again");
            }
        });*/
        
        //IndexedDB
        async function checkifconversationexists() {
            var results = await connection.select({
                    from: 'conversation_review',
                    where: {
                        index_key: 0
                    }
                })
                if (results.length == 0) {
                    console.log('No conversation data exists, creating default data');
                    async function insertconversation_data() {
                        var insertsoundreview = await connection.insert({
                            into: "conversation_review",
                            values: [insertconversation1,insertconversation2,insertconversation3,insertconversation4,insertconversation5,insertconversation6,insertconversation7,insertconversation8,insertconversation9,insertconversation10,insertconversation11,insertconversation12,insertconversation13,insertconversation14,insertconversation15,insertconversation16,insertconversation17,insertconversation18,insertconversation19,insertconversation20,insertconversation21,insertconversation22,insertconversation23,insertconversation24,insertconversation25,insertconversation26,insertconversation27,insertconversation28,insertconversation29,insertconversation30,insertconversation31,insertconversation32,insertconversation33,insertconversation34,insertconversation35,insertconversation36,insertconversation37,insertconversation38,insertconversation39,insertconversation40,insertconversation41,insertconversation42,insertconversation43,insertconversation44,insertconversation45,insertconversation46,insertconversation47,insertconversation48,insertconversation49,insertconversation50,insertconversation51,insertconversation52,insertconversation53,insertconversation54,insertconversation55,insertconversation56,insertconversation57,insertconversation58,insertconversation59,insertconversation60,insertconversation61,insertconversation62,insertconversation63,insertconversation64,insertconversation65,insertconversation66,insertconversation67,insertconversation68,insertconversation69,insertconversation70,insertconversation71,insertconversation72,insertconversation73,insertconversation74,insertconversation75,insertconversation76,insertconversation77,insertconversation78]
                        })
                    }
                    insertconversation_data();
                }
        }
        checkifconversationexists();

    };


    $scope.ep_review = function() {
        var review = '';
        var index_key = $scope.index;
        var type = $scope.key;
        var language = $scope.lang;

        for (var i in $scope.ep_review_arr) {
            if ($scope.ep_review_arr[i] === true) {
                review += '0';
            } else {
                review += '1';
            }
        }

        //IndexedDB
        async function updateTick_ep() {
            var update = await connection.update({
                in: 'ep_review',
                where: {
                    index_key: Number(index_key),
                    type: type,
                    language: 'b'
                },
                set: {
                    review: review
                }
            })
        }
        updateTick_ep();
    }
    $scope.insert_ep_database = function() {
        /*var fs = require('fs');
        fs.writeFile("./www/json/ep_database.json", JSON.stringify({"status": true}), function(err) {
            if (err) {
                alert("Please try again");
            }
        });*/

        //IndexedDB
        async function checkifEPexists() {
            var results = await connection.select({
                    from: 'ep_review',
                    where: {
                        index_key: 0
                    }
                })
                if (results.length == 0) {
                    console.log('No ep_review data exists, creating default data');
                    async function insertEP_data() {
                        var insertEP = await connection.insert({
                            into: "ep_review",
                            values: [insertep1,insertep2,insertep3,insertep4,insertep5,insertep6,insertep7]
                        })
                    }
                    insertEP_data();
                }
        }
        checkifEPexists();

    };

    //home page
    //subpages
    $scope.left_menu_clk = function($event) {
        if ($($event.currentTarget).parents('.page_2_partial').find('.left_part').hasClass('open')) {
            $($event.currentTarget).parents('.page_2_partial').find('.left_part').addClass('close').removeClass('open');
            $($event.currentTarget).parents('.page_2_partial').find('.left_part').animate({
                left: '-100%'
            }, 500, "linear");
            $($event.currentTarget).parents('.page_2_partial').find('.left_menu').css('background-position', '-2px 11px');
            $('.left_part').removeClass('left_part_m');
            $('.right_part').removeClass('right_part_m');
        } else {
            $($event.currentTarget).parents('.page_2_partial').find('.left_part').addClass('open').removeClass('close');
            $($event.currentTarget).parents('.page_2_partial').find('.left_part').animate({
                left: '0%'
            }, 500, "linear");
            $($event.currentTarget).parents('.page_2_partial').find('.left_menu').css('background-position', '-8px 11px');
            $('.left_part').addClass('left_part_m');
            $('.right_part').addClass('right_part_m');
        }
    };
    $scope.up_clk = function($event) {

        hidel_elem();


        if ($scope.current_section == 'Sounds') {
            $scope.load_section($event, 'sound_page');
        }
        if ($scope.current_section == 'Exercises') {
            $scope.load_section($event, 'ex_page');
        }
        if ($scope.current_section == 'Conversations') {
            $scope.load_section($event, 'con_page');
        }
        if ($scope.current_section == 'Exam speaking') {
            $scope.load_section($event, 'exam_page');
        }


    };
    $scope.drop_clk = function($event) {
        if ($scope.dropdown) {
            $scope.dropdown = false;
        } else {
            $scope.dropdown = true;
        }
    };
    //end subpages
    $scope.s_info = function($event, info, cols) {

        if (!$($event.currentTarget).hasClass('selected')) {
            $($event.currentTarget).parents('.tbody').find('tr').removeAttr('style');

            $($event.currentTarget).parents('tbody').find('.infoB').removeClass('selected');
            $($event.currentTarget).addClass('selected');

            $($event.currentTarget).parents('tbody').find('tr[data-notesText]').fadeOut(300).remove();
            $($event.currentTarget).parents('tbody').find('.notesText').fadeOut(300);
            var txt = '<tr data-notesText><td style="padding:0;" colspan="' + cols + '"><div class="notesText" style="display:block;">' + info + '</td></div></tr>';
            $($event.currentTarget).parents('tr').after(txt);
        } else {
            $($event.currentTarget).removeClass('selected');
            $($event.currentTarget).parents('tbody').find('tr[data-notesText]').fadeOut(300).remove();
            $($event.currentTarget).parents('tr').removeAttr('style');
        }
    };

    $scope.while_playing = function() {
        //$('.play').css('background-position-x', '-58px');
        $('.file_play').addClass('play').removeClass('stop');
        $rootScope.audio_obj.pause();
        if (typeof(sound) != 'undefined' && sound != null) {
            sound.pause();
        }
    };

    $scope.play_audio_common = function(file_name, $event) {

        if (!$($event.target).hasClass('play')) {
            $scope.while_playing();
        } else {
            $rootScope.audio_obj = null;
            $rootScope.audio_obj = new Audio();
            //alert(baseWebsiteUrl + $($event.target).attr('data-path'));
            //$rootScope.audio_obj = $($event.target).next('audio')[0];
            $rootScope.audio_obj.src = $($event.target).attr('data-path');
            $rootScope.audio_obj.play();
            //$('.play').css('background-position', '-58px 1px');
            $('.file_play').addClass('play');
            //$($event.target).css('background-position', '-270px 1px');
            $($event.target).addClass('stop').removeClass('play');
            /*$rootScope.audio_obj.onended = function () {
             alert('eneded');
             $('.play').css('background-position', '-58px 1px');
             };*/
            $rootScope.audio_obj.addEventListener('ended', function() {
                //alert('eneded');
                //$('.play').css('background-position', '-58px 1px');
                $('.file_play').addClass('play').removeClass('stop');
            });
            $rootScope.audio_obj.addEventListener('play', function() {
                $($event.target).removeClass('play').addClass('stop');
                $('.file_play').removeClass('play');
            });
        }
    };

    $scope.play_wav = function(file_path, $event) {
        if ($($event.target).css('background-position-x') != '-58px') {
            $scope.while_playing();
        } else {
            var _file_path = file_path;
            file_path = 'media/recording/' + file_path;
            // var fs = require('fs');
            /* fs.exists('./www/' + file_path, function(exists) {
                 if (exists) {
                     // serve file
                     //var audio_obj = new Audio();
                     $rootScope.audio_obj.src = file_path;
                     setTimeout(function() {
                         $rootScope.audio_obj.play();
                         $('.play').css('background-position-x', '-58px');
                         $($event.target).css('background-position-x', '-270px');

                         $rootScope.audio_obj.onended = function() {
                             $('.play').css('background-position-x', '-58px');
                         };
                     }, 300);

                 }  else {
                     $('.popupC').show();
                 } 
             });  */


        }

    };

    $scope.start_record = function(file_name, $event) {
        $('.popupC').hide();
        if (recorder) {
            if ($($event.target).attr('data-audio_status') == 'start') {
                $($event.target).attr('data-audio_status', 'end');
                $rootScope.start_recorder = true;

                $($event.target).parents('.practice_div').find('.record').each(function() {
                    $(this).attr('data-audio_status', 'start');
                });
                $('div[data-audio_status').attr('data-audio_status', 'start');
                $($event.target).attr('data-audio_status', 'end');

            } else {
                $($event.target).attr('data-audio_status', 'start');
                $rootScope.start_recorder = false;
            }

            if ($rootScope.start_recorder) {
                $rootScope.start_recorder = false;
                recorder && recorder.stop();
                recorder.clear();
                recorder && recorder.record();
                //button.disabled = true;
                //button.nextElementSibling.disabled = false;
                __log('Recording...');
            } else {
                $rootScope.start_recorder = true;
                recorder && recorder.stop();
                __log('Stopped recording.');

                // create WAV download link using audio data blob
                recorder && recorder.exportWAV(function(blob) {
                    var reader = new FileReader();
                    reader.onload = function() {
                        var dataUrl = reader.result;
                        var base64 = dataUrl.split(',')[1];
                        //  var fs = require('fs');
                        var buf = new Buffer(base64, 'base64'); // decode
                        /* fs.writeFile('www/media/recording/' + file_name + '.wav', buf, function(err) {
                             if (err) {
                                 console.log(err);
                             } else {
                                 console.log("The file was saved!");
                             }
                         }); */
                    };
                    reader.readAsDataURL(blob);



                });
                recorder.clear();
            }
        }


    };

    $scope.play_all = function($event) {
        if ($($event.target).css('background-position-x') != '-58px') {
            $scope.while_playing();
        } else {
            $('.play').css('background-position-x', '-58px');
            $($event.target).css('background-position-x', '-270px');
            var _arr = [];
            $($event.target).parents('.conv_grp').find('.play').each(function() {
                if (typeof $(this).attr('data-audio') != 'undefined') {

                    //var file = './www/' + $(this).attr('data-audio');
                    var file_name = $(this).attr('data-audio');
                    _arr.push(file_name);
                }
            });
            $scope.play_each(_arr);
        }
    };

    $scope.play_each = function(_arr) {
        //var audio_obj = new Audio();
        var cnt = 0;
        play_each_file();

        function play_each_file() {
            if (cnt <= (_arr.length - 1)) {
                //   var fs = require('fs');
                /* fs.exists('./www/' + _arr[cnt], function(exists) {
                     if (exists) {
                         // serve file
                         $rootScope.audio_obj.src = _arr[cnt];
                         setTimeout(function() {
                             $rootScope.audio_obj.play();
                         }, 300);
                     } else {
                         cnt++;
                         play_each_file();
                     }
                 }); */
            } else {
                $('.play').css('background-position-x', '-58px');
                return false;
            }
        }
        $rootScope.audio_obj.onended = function() {
            if (cnt == (_arr.length - 1) || cnt == _arr.length) {
                $('.play').css('background-position-x', '-58px');
            }
            cnt++;
            play_each_file();


        };

    };
    $scope.hide_popupC = function() {
        $('.popupC').hide();
    };
    $scope.change_lang_ep = function(val) {
        var file_name = '';
        $('.spearkerContainer_audio').each(function() {
            file_name = $(this).find('source').attr('src');
            if (val == 1) {
                file_name = file_name.replace(/_us/g, "_gb");
            } else {
                file_name = file_name.replace(/_gb/g, "_us");
            }
            $(this).find('source').attr('ng-src', file_name);
            $(this).find('source').attr('src', file_name);
        });
    };

    //sound page
    $scope.go_btn_clk = function($event, index, key, lang) {
        //british
        hidel_elem();
        $rootScope.reordering_timer = 5.00;
        $rootScope.snap_timer = 2.00;
        $rootScope.score = 0;
        $rootScope.percentage_score = '';
        $scope.ep_lang = '1';

        //console.log('set to ::' + $rootScope.snap_timer);
        window.scrollTo(0, 0);
        if ($rootScope.snap_stop) {
            clearInterval($rootScope.snap_stop);
        }
        if ($rootScope.timerInt) {
            clearInterval($rootScope.timerInt);
        }
        if ($rootScope.memery_match_timer) {
            clearInterval($rootScope.memery_match_timer);
        }
        if ($rootScope.reorder_timer) {
            clearInterval($rootScope.reorder_timer);
        }
        if ($rootScope.flip_card_timer) {
            clearInterval($rootScope.flip_card_timer);
        }
        if (typeof(stop) != "undefined") {
            if (stop) {
                clearInterval(stop);
            }
        }
        if ($scope.current_section == 'Sounds') {
            $scope.sound2_var = false;
            $scope.left_menu = false;
            $scope.head_h1 = 'Sound ' + $scope.sounds_data[key][index]['short_name'];

            $scope.key = key;
            $scope.index = index;
            $scope.lang = lang;

            $scope.review_val = new Array();
            $scope.review_val[0] = 'notselected';
            $scope.review_val[1] = 'notselected';
            $scope.review_val[2] = 'notselected';
            $scope.review_val[3] = 'notselected';

            //console.log('--index::' + index + '--key::' + key + '--lang::' + lang);
                
            //IndexedDB
            async function selectReview() {
                var results = await connection.select({
                    from: 'sounds_review',
                    where: {
                        index_key: index,
                        type: key,
                        language: lang
                    }
                })
                if (results.length == 1) {
                    if (results[0]['review'] == 0) {
                        $scope.review_val[0] = '';
                    }
                    if (results[0]['review'] == 1) {
                        $scope.review_val[1] = 'selected';
                    }
                    if (results[0]['review'] == 2) {
                        $scope.review_val[2] = 'selected';
                    }
                    if (results[0]['review'] == 3) {
                        $scope.review_val[3] = 'selected';
                    }
                }
            }
            selectReview();


            $scope.sound_page2_html = 'partials/blank.html';
            setTimeout(function() {
                $scope.sound_page2_html = 'partials/sound_page2.html';
                $('.main_wrapper').trigger('click');
                // video_resize();
            }, 200);
            $scope.scroll_bar();
            //$('html').css('overflow-y', 'hidden !important');
        }
        if ($scope.current_section == 'Exercises') {
            $scope.random_ex(); //to make all exercise random
            $scope.ex2_var = false;
            $scope.left_menu = false;
            $scope.head_h1 = 'Choose an exercise';

            if (key == 'dictation') {
                $scope.head_h1 = 'Dictation';
            }
            if (key == 'matchup') {
                $scope.head_h1 = 'Match-up';
            }
            if (key == 'reordering') {
                $scope.head_h1 = 'Reordering';
            }
            if (key == 'sounds_n_spelling') {
                $scope.head_h1 = 'Sounds and Spelling';
            }
            if (key == 'sorting') {
                $scope.head_h1 = 'Sorting';
            }
            if (key == 'odd_one_out') {
                $scope.head_h1 = 'Odd One Out';
            }
            if (key == 'snap') {
                $scope.head_h1 = 'Snap!';
            }
            if (key == 'memory_match') {
                $scope.head_h1 = 'Memory Match';
                $scope.review_display = true;
            } else {
                $scope.review_display = false;
            }
            $scope.s_head_h1 = $scope.head_h1



            $scope.exercise = $rootScope.ex_data[key][index]['exercise'];
            $rootScope.cnt = 0;
            $rootScope.key = key;
            $rootScope.index = index;
            $rootScope.lang = lang;
            $rootScope.size = $rootScope.ex_data[key][index][lang][0]['act'].length;
            $scope.key = key;
            $scope.index = index;
            $scope.lang = lang;
            $rootScope.score = 0;
            $rootScope.totalScore = 0;
            $scope.exercise_tpl.url_ = 'partials/' + $scope.key + '.html';

            $scope.exercise_tpl.url = null;
            setTimeout(function() {
                $scope.exercise_tpl.url = $scope.exercise_tpl.url_;
                $('.main_wrapper').trigger('click');
                $('.disabler').hide();
                $('._practise_accor').addClass('selected').next().slideDown();
                $('.reviewC').removeClass('selected').next().slideUp();
                $rootScope.score = 0;

                var temp_html = '';
                for (var i in $rootScope.ex_data[key][index][lang][0]['left_p']) {
                    temp_html += '<p>' + $rootScope.ex_data[key][index][lang][0]['left_p'][i] + '</p>';
                }
                setTimeout(function() {
                    $('.intructions_p').empty().html(temp_html).fadeIn('slow');
                }, 200);
                $('.score_ele').text('You have answered 0 out of 0 correctly.');
            }, 200);
        }
        //$('html').css('overflow', 'auto');

        if ($scope.current_section == 'Conversations') {
            $scope.con2_var = false;
            $scope.left_menu = false;
            $scope.head_h1 = $scope.con_data[key][index]['function'];
            $scope.s_head_h1 = $scope.con_data[key][index]['short_name'];
            $scope.key = key;
            $scope.index = index;
            $scope.lang = lang;
            $scope.study_checkbox = new Array();

            for (var i = 0; i < $scope.con_data[key][index][lang][0]['left_text'].length; i++) {
                $scope.study_checkbox[i] = false;
            }
            $scope.scroll_bar();


            $scope.con_page2_html = 'partials/blank.html';
            setTimeout(function() {
                $scope.con_page2_html = 'partials/con_page2.html';
                $('.main_wrapper').trigger('click');
            }, 200);
            //$('html').css('overflow', 'auto');

            $scope.conversation_review_arr = new Array();
            for (var i in $scope.con_data[key][index][lang][0]['reviews']) {
                $scope.conversation_review_arr[i] = false;
            }

            //IndexedDB
            async function converNotes() {
                var results = await connection.select({
                    from: 'conversation_review',
                    where: {
                        index_key: Number(index),
                        type: key,
                        language: lang
                    }
                });
                if (results.length == 1) {
                    setTimeout(function() {
                        var temp_txt = results[0]['notes'];
                        if (temp_txt.trim() != '') {
                            temp_txt = temp_txt.replace(/\#\|\#/g, "'");
                            temp_txt = temp_txt.replace(/\#\|\|\#/g, '"');
                        }

                        $('.your_notes_txt').val(temp_txt);
                    }, 500);

                    if (results[0]['review'] != '') {
                        var temp_arr = new Array();
                        temp_arr = results[0]['review'].split('');
                        for (var i in temp_arr) {
                            if (temp_arr[i] == '0') {
                                $scope.conversation_review_arr[i] = true;
                            } else {
                                $scope.conversation_review_arr[i] = false;
                            }
                        }
                    }
                }
            }
            converNotes();

            //recording
            console.log($scope.con_data);
        }
        if ($scope.current_section == 'Exam speaking') {
            $scope.exam2_var = false;
            $scope.left_menu = false;


            $scope.key = key;
            $scope.index = index;
            $scope.lang = lang;
            $scope.head_h1 = $scope.exam_data[key][index]['task'];
            $scope.s_head_h1 = $scope.exam_data[key][index]['short_name'];
            $scope.video_url = $scope.exam_data[key][index]['video1'];

            /*$('.image_box_wrap > div').fancybox({
                scrolling: 'hidden',
                helpers: {
                    overlay: {
                        locked: true
                    }
                }
            });*/

            $scope.study_checkbox = new Array();

            for (var i = 0; i < $scope.exam_data[key][index]['left_text_in'].length; i++) {
                $scope.study_checkbox[i] = false;
            }
            $scope.scroll_bar();
            $scope.exam_page2_html = 'partials/blank.html';
            setTimeout(function() {
                $scope.exam_page2_html = 'partials/exam_page2.html';
                $('.main_wrapper').trigger('click');
                //video_resize();
            }, 200);
            //$('html').css('overflow-y', 'hidden');

            $scope.ep_review_arr = new Array();

            for (var i in $scope.exam_data[key][index]['reviews']) {
                $scope.ep_review_arr[i] = false;
            }
            console.log($scope.ep_review_arr);

            //IndexedDB
            async function EP_notes() {
                var results = await connection.select({
                    from: 'ep_review',
                    where: {
                        index_key: Number(index),
                        type: key
                    }
                })
                if (results.length == 1) {
                    setTimeout(function() {
                        var temp_txt = results[0]['notes'];
                        if (temp_txt.trim() != '') {
                            temp_txt = temp_txt.replace(/\#\|\#/g, "'");
                            temp_txt = temp_txt.replace(/\#\|\|\#/g, '"');

                            var temp_txt_arr = temp_txt.split('|==|');
                            if (temp_txt_arr.length > 0) {
                                var cnt = 0;
                                $('.your_notes_txt').each(function() {
                                    $(this).val(temp_txt_arr[cnt]);
                                    cnt++;
                                });
                            }

                        }
                    }, 500);

                    if (results[0]['review'] != '') {
                        var temp_arr = new Array();
                        temp_arr = results[0]['review'].split('');
                        for (var i in temp_arr) {
                            if (temp_arr[i] == '0') {
                                $scope.ep_review_arr[i] = true;
                            } else {
                                $scope.ep_review_arr[i] = false;
                            }
                        }
                    }
                }
            }
            EP_notes();
            
        }
    };

    $scope.help_btn = function() {
        var OpenWindow = window.open("help.html", "Help Document", '');
    };

    $scope.random_ex = function() {

        //sounds n spelling
        for (var i = 0; i < 14; i++) {
            $rootScope.ex_data['sounds_n_spelling'][i]["b"][0]['act'] = shuffleArray($rootScope.ex_data['sounds_n_spelling'][i]["b"][0]['act'].slice(0));
            $rootScope.ex_data['sounds_n_spelling'][i]["a"][0]['act'] = shuffleArray($rootScope.ex_data['sounds_n_spelling'][i]["a"][0]['act'].slice(0));
        }
        //sounds n spelling

        //snap
        $rootScope.ex_data['snap'][0]["b"][0]['act'] = shuffleArray($rootScope.ex_data['snap'][0]["b"][0]['act'].slice(0));
        $rootScope.ex_data['snap'][0]["a"][0]['act'] = shuffleArray($rootScope.ex_data['snap'][0]["a"][0]['act'].slice(0));

        $rootScope.ex_data['snap'][1]["b"][0]['act'] = shuffleArray($rootScope.ex_data['snap'][1]["b"][0]['act'].slice(0));
        $rootScope.ex_data['snap'][1]["a"][0]['act'] = shuffleArray($rootScope.ex_data['snap'][1]["a"][0]['act'].slice(0));
        
        $rootScope.ex_data['snap'][2]["b"][0]['act'] = shuffleArray($rootScope.ex_data['snap'][2]["b"][0]['act'].slice(0));
        $rootScope.ex_data['snap'][2]["a"][0]['act'] = shuffleArray($rootScope.ex_data['snap'][2]["a"][0]['act'].slice(0));
        //snap

        //sorting
        $rootScope.ex_data['sorting'][0]["b"][0]['act'] = shuffleArray($rootScope.ex_data['sorting'][0]["b"][0]['act'].slice(0));
        $rootScope.ex_data['sorting'][0]["a"][0]['act'] = shuffleArray($rootScope.ex_data['sorting'][0]["a"][0]['act'].slice(0));

        $rootScope.ex_data['sorting'][1]["b"][0]['act'] = shuffleArray($rootScope.ex_data['sorting'][1]["b"][0]['act'].slice(0));
        $rootScope.ex_data['sorting'][1]["a"][0]['act'] = shuffleArray($rootScope.ex_data['sorting'][1]["a"][0]['act'].slice(0));

        $rootScope.ex_data['sorting'][2]["b"][0]['act'] = shuffleArray($rootScope.ex_data['sorting'][2]["b"][0]['act'].slice(0));
        $rootScope.ex_data['sorting'][2]["a"][0]['act'] = shuffleArray($rootScope.ex_data['sorting'][2]["a"][0]['act'].slice(0));
        
        $rootScope.ex_data['sorting'][3]["b"][0]['act'] = shuffleArray($rootScope.ex_data['sorting'][3]["b"][0]['act'].slice(0));
        $rootScope.ex_data['sorting'][3]["a"][0]['act'] = shuffleArray($rootScope.ex_data['sorting'][3]["a"][0]['act'].slice(0));
        //sorting

        //dictation
        $rootScope.ex_data['dictation'][0]["b"][0]['act'] = shuffleArray($rootScope.ex_data['dictation'][0]["b"][0]['act'].slice(0));
        $rootScope.ex_data['dictation'][0]["a"][0]['act'] = shuffleArray($rootScope.ex_data['dictation'][0]["a"][0]['act'].slice(0));

        $rootScope.ex_data['dictation'][1]["b"][0]['act'] = shuffleArray($rootScope.ex_data['dictation'][1]["b"][0]['act'].slice(0));
        $rootScope.ex_data['dictation'][1]["a"][0]['act'] = shuffleArray($rootScope.ex_data['dictation'][1]["a"][0]['act'].slice(0));

        $rootScope.ex_data['dictation'][2]["b"][0]['act'] = shuffleArray($rootScope.ex_data['dictation'][2]["b"][0]['act'].slice(0));
        $rootScope.ex_data['dictation'][2]["a"][0]['act'] = shuffleArray($rootScope.ex_data['dictation'][2]["a"][0]['act'].slice(0));
        
        $rootScope.ex_data['dictation'][3]["b"][0]['act'] = shuffleArray($rootScope.ex_data['dictation'][3]["b"][0]['act'].slice(0));
        $rootScope.ex_data['dictation'][3]["a"][0]['act'] = shuffleArray($rootScope.ex_data['dictation'][3]["a"][0]['act'].slice(0));
        //dictation

        //matchup
        $rootScope.ex_data['matchup'][0]["b"][0]['act'] = shuffleArray($rootScope.ex_data['matchup'][0]["b"][0]['act'].slice(0));
        $rootScope.ex_data['matchup'][0]["a"][0]['act'] = shuffleArray($rootScope.ex_data['matchup'][0]["a"][0]['act'].slice(0));

        $rootScope.ex_data['matchup'][1]["b"][0]['act'] = shuffleArray($rootScope.ex_data['matchup'][1]["b"][0]['act'].slice(0));
        $rootScope.ex_data['matchup'][1]["a"][0]['act'] = shuffleArray($rootScope.ex_data['matchup'][1]["a"][0]['act'].slice(0));

        $rootScope.ex_data['matchup'][2]["b"][0]['act'] = shuffleArray($rootScope.ex_data['matchup'][2]["b"][0]['act'].slice(0));
        $rootScope.ex_data['matchup'][2]["a"][0]['act'] = shuffleArray($rootScope.ex_data['matchup'][2]["a"][0]['act'].slice(0));
        
        $rootScope.ex_data['matchup'][3]["b"][0]['act'] = shuffleArray($rootScope.ex_data['matchup'][3]["b"][0]['act'].slice(0));
        $rootScope.ex_data['matchup'][3]["a"][0]['act'] = shuffleArray($rootScope.ex_data['matchup'][3]["a"][0]['act'].slice(0));
        //matchup

        //reordering
        $rootScope.ex_data['reordering'][0]["b"][0]['act'] = shuffleArray($rootScope.ex_data['reordering'][0]["b"][0]['act'].slice(0));
        $rootScope.ex_data['reordering'][0]["a"][0]['act'] = shuffleArray($rootScope.ex_data['reordering'][0]["a"][0]['act'].slice(0));

        $rootScope.ex_data['reordering'][1]["b"][0]['act'] = shuffleArray($rootScope.ex_data['reordering'][1]["b"][0]['act'].slice(0));
        $rootScope.ex_data['reordering'][1]["a"][0]['act'] = shuffleArray($rootScope.ex_data['reordering'][1]["a"][0]['act'].slice(0));
        
        $rootScope.ex_data['reordering'][2]["b"][0]['act'] = shuffleArray($rootScope.ex_data['reordering'][2]["b"][0]['act'].slice(0));
        $rootScope.ex_data['reordering'][2]["a"][0]['act'] = shuffleArray($rootScope.ex_data['reordering'][2]["a"][0]['act'].slice(0));
        //reordering

        //memory_match
        $rootScope.ex_data['memory_match'][0]["b"][0]['act'] = shuffleArray($rootScope.ex_data['memory_match'][0]["b"][0]['act'].slice(0));
        $rootScope.ex_data['memory_match'][0]["a"][0]['act'] = shuffleArray($rootScope.ex_data['memory_match'][0]["a"][0]['act'].slice(0));

        $rootScope.ex_data['memory_match'][1]["b"][0]['act'] = shuffleArray($rootScope.ex_data['memory_match'][1]["b"][0]['act'].slice(0));
        $rootScope.ex_data['memory_match'][1]["a"][0]['act'] = shuffleArray($rootScope.ex_data['memory_match'][1]["a"][0]['act'].slice(0));
        
        $rootScope.ex_data['memory_match'][2]["b"][0]['act'] = shuffleArray($rootScope.ex_data['memory_match'][2]["b"][0]['act'].slice(0));
        $rootScope.ex_data['memory_match'][2]["a"][0]['act'] = shuffleArray($rootScope.ex_data['memory_match'][2]["a"][0]['act'].slice(0));
        //memory_match

        //odd_one_out
        $rootScope.ex_data['odd_one_out'][0]["b"][0]['act'] = shuffleArray($rootScope.ex_data['odd_one_out'][0]["b"][0]['act'].slice(0));
        $rootScope.ex_data['odd_one_out'][0]["a"][0]['act'] = shuffleArray($rootScope.ex_data['odd_one_out'][0]["a"][0]['act'].slice(0));

        $rootScope.ex_data['odd_one_out'][1]["b"][0]['act'] = shuffleArray($rootScope.ex_data['odd_one_out'][1]["b"][0]['act'].slice(0));
        $rootScope.ex_data['odd_one_out'][1]["a"][0]['act'] = shuffleArray($rootScope.ex_data['odd_one_out'][1]["a"][0]['act'].slice(0));

        $rootScope.ex_data['odd_one_out'][2]["b"][0]['act'] = shuffleArray($rootScope.ex_data['odd_one_out'][2]["b"][0]['act'].slice(0));
        $rootScope.ex_data['odd_one_out'][2]["a"][0]['act'] = shuffleArray($rootScope.ex_data['odd_one_out'][2]["a"][0]['act'].slice(0));
        
        $rootScope.ex_data['odd_one_out'][3]["b"][0]['act'] = shuffleArray($rootScope.ex_data['odd_one_out'][3]["b"][0]['act'].slice(0));
        $rootScope.ex_data['odd_one_out'][3]["a"][0]['act'] = shuffleArray($rootScope.ex_data['odd_one_out'][3]["a"][0]['act'].slice(0));
        //odd_one_out



    };

    $scope.play_audio = function($event) {
        var playB = new Audio();
        var vidType = 'audio/ogg';
        var codType = 'vorbis';
        if ($($event.target)[0].nodeName.toLowerCase() == 'strong' || $($event.target)[0].nodeName.toLowerCase() == 'span') {
            playB.src = $($event.target).parents('.sentenceListAudio').find('audio').find('source').attr('src');
        } else {
            playB.src = $($event.target).find('audio').find('source').attr('src');
        }
        //console.log(playB);
        var tar = $($event.target);
        if (tar.hasClass('active') || tar.parents('.sentenceListAudio').hasClass('active')) {
            // tar.removeClass('selected');
            playB.pause();
            tar.parents('.sentenceListAudio').addClass('pe-none');
            tar.addClass('pe-none')
        } else {
            //tar.addClass('selected');
            playB.play();
            playB.addEventListener("play", function() {
                tar.parents('.sentenceListAudio').addClass('active pe-none');
                tar.addClass('active pe-none')
            });
            playB.addEventListener("ended", function() {
                tar.parents('.sentenceListAudio').removeClass('active pe-none');
                tar.removeClass('active pe-none')
            });
        }
    }
    $scope.scroll_bar = function() {
        if ($(window).height() < 500) {
            $('.scroll_bar').css('max-height', '480px');
        } else {
            $('.scroll_bar').css('max-height', $(window).height());
        }
        setTimeout(function() {
            set_max_height();
            // $('html').css('overflow-y', 'hidden');
        }, 300);

    };

    $scope.accordion_title = function($event) {

        if ($($event.currentTarget).hasClass('selected')) {
            $($event.currentTarget).removeClass('selected').next().slideUp(400);
        } else {
            //$($event.currentTarget).parents('ul').find('.accordion_title').removeClass('selected').next().slideUp(400);
            $($event.currentTarget).addClass('selected');
            $($event.currentTarget).next().slideDown(400);
        }
    };

    $scope.accordion_heading = function($event) {
        //console.log($event);
    }

    $scope.info_btn_clk = function($event) {
        if ($(window).width() <= 900) {
            if ($($event.target).hasClass('info_ic')) {
                if ($($event.target).attr('data-show') == 'hide') {
                    $($event.target).parents('.task_list_ul').find('.info_text').slideUp();
                    $($event.target).parents('.task_list_ul').find('.info_ic').attr('data-show', 'hide').removeClass('selected');
                    $($event.target).addClass('selected');
                    $($event.target).attr('data-show', 'show');
                    $($event.target).parents('li').find('.info_text').slideDown();
                } else {
                    $($event.target).attr('data-show', 'hide');
                    $($event.target).removeClass('selected');
                    $($event.target).parents('.task_list_ul').find('.info_text').slideUp();
                }
            }
        }
    };
    $scope.hoverIn = function($event, info) {
        if ($(window).width() > 900) {
            $('.arrow_wrp').show();
            var pos = $($event.target).position();
            $($event.target).addClass('selected');
            $('.arrow_box').html(info);
            $('.arrow_wrp').css('top', pos.top - ($('.arrow_wrp').height() / 2) + 16);
            $('.arrow_wrp').css('left', pos.left + 36);
        }
    };
    $scope.hoverOut = function($event) {
        if ($(window).width() > 900) {
            $('.arrow_wrp').hide();
            $('.info_ic').removeClass('selected');
        }
    };
    $scope.video_tap = function($event) {
        //console.log($event);
        //$($event.target).fancybox();
    };

    //end sound page


    //end sound page


    $scope._refresh = function() {
        $scope.exercise_tpl.url = 'partials/blank.html';
        setTimeout(function() {
            $scope.exercise_tpl.url = $scope.exercise_tpl.url_;
            $('.main_wrapper').trigger('click');
            $('.disabler').hide();
            $('.reviewC').removeClass('selected').next().slideUp();


        }, 200);
    };
    $scope._back = function() {
        if ($rootScope.cnt > 0) {
            $rootScope.cnt--;
            $scope.exercise_tpl.url = 'partials/blank.html';
            setTimeout(function() {
                $scope.exercise_tpl.url = $scope.exercise_tpl.url_;
                $('.main_wrapper').trigger('click');
                $('.disabler').hide();
                $('.reviewC').removeClass('selected').next().slideUp();


            }, 200);
        }
    };
    $scope.cal_percentage = function() {
        var temp_perc = ($rootScope.score / $rootScope.totalScore) * 100;

        if (temp_perc > 99) {
            $rootScope.percentage_score = 'Perfect!' + ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-emoji-heart-eyes" viewBox="0 0 16 16">  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M11.315 10.014a.5.5 0 0 1 .548.736A4.498 4.498 0 0 1 7.965 13a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .548-.736h.005l.017.005.067.015.252.055c.215.046.515.108.857.169.693.124 1.522.242 2.152.242.63 0 1.46-.118 2.152-.242a26.58 26.58 0 0 0 1.109-.224l.067-.015.017-.004.005-.002zM4.756 4.566c.763-1.424 4.02-.12.952 3.434-4.496-1.596-2.35-4.298-.952-3.434zm6.488 0c1.398-.864 3.544 1.838-.952 3.434-3.067-3.554.19-4.858.952-3.434z"/></svg>';
        } else {
            if (temp_perc >= 75 && temp_perc <= 99) {
                $rootScope.percentage_score = 'Well done!' + ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-emoji-laughing" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M12.331 9.5a1 1 0 0 1 0 1A4.998 4.998 0 0 1 8 13a4.998 4.998 0 0 1-4.33-2.5A1 1 0 0 1 4.535 9h6.93a1 1 0 0 1 .866.5zM7 6.5c0 .828-.448 0-1 0s-1 .828-1 0S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 0-1 0s-1 .828-1 0S9.448 5 10 5s1 .672 1 1.5z"/></svg>';
            } else {
                if (temp_perc >= 50 && temp_perc <= 74) {
                    $rootScope.percentage_score = 'Good' + ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-emoji-wink" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm1.757-.437a.5.5 0 0 1 .68.194.934.934 0 0 0 .813.493c.339 0 .645-.19.813-.493a.5.5 0 1 1 .874.486A1.934 1.934 0 0 1 10.25 7.75c-.73 0-1.356-.412-1.687-1.007a.5.5 0 0 1 .194-.68z"/></svg>';
                } else {
                    if (temp_perc >= 25 && temp_perc <= 49) {
                        $rootScope.percentage_score = 'OK' + ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16"><path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/></svg>';
                    } else {
                        if (temp_perc >= 10 && temp_perc <= 24) {
                            $rootScope.percentage_score = 'Good try' + ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16"><path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/></svg>';
                        } else {
                            console.log('No comment');
                        }
                    }
                }
            }
        }
    };
});
angular.module('myApp.Sound_Spelling_Ctrl', []).controller('Sound_Spelling_Ctrl', function($scope, $rootScope, $http, $interval) {
    var key = $rootScope.key;
    var lang = $rootScope.lang;
    var index = $rootScope.index;
    $rootScope.mainAns = true;

    data = $rootScope.ex_data['sounds_n_spelling'][index][lang][0]['act'][$rootScope.cnt];
    //$http.get('json/sound_spelling.json').success(function(data) {
    $scope.words = shuffleArray(data.data.slice(0));
    $scope.audio = {};
    $scope.audio.src = data.audio.src;
    $scope.question = data.question[0];
    //$rootScope.totalScore = $rootScope.ex_data['sounds_n_spelling'][index][lang][0]['act'].length;

    //        $('.spelling_border').css('border', 'none');
    $scope.playAudio = function($event) {
        //var playB = $($event.target).find('.reorderAudio')[0];
        var playB = $($event.target).find('audio');
        var tar = $($event.target);
        if (tar.hasClass('selected')) {
            //tar.removeClass('selected');
            //playB.get(0).pause();
        } else {
            //tar.addClass('selected');
            playB.get(0).play();
        }
    };
    $('.reorderAudio').bind("play", function() {
        $(this).closest('.speaker').addClass('selected');
    });
    $('.reorderAudio').bind("ended", function() {
        $(this).closest('.speaker').removeClass('selected');
    });

    var arr = $scope.question.text.split('_');
    if (arr[1] == '') {
        //right _
        var span = document.createElement('span');
        $('.spelling_border1')[0].appendChild(span);
        span.innerHTML = '' + arr[0];
        var span = document.createElement('span');
        $('.spelling_border1')[0].appendChild(span);
        span.setAttribute("class", "ans");
        span.innerHTML = '';
    } else if (arr[0] == '') {
        //left _
        var span = document.createElement('span');
        $('.spelling_border1')[0].appendChild(span);
        span.setAttribute("class", "ans");
        span.innerHTML = '';
        var span = document.createElement('span');
        $('.spelling_border1')[0].appendChild(span);
        span.innerHTML = '' + arr[1];
    } else {
        //middle _
        var span = document.createElement('span');
        $('.spelling_border1')[0].appendChild(span);
        span.innerHTML = '' + arr[0];
        var span = document.createElement('span');
        $('.spelling_border1')[0].appendChild(span);
        span.setAttribute("class", "ans");
        span.innerHTML = '';
        var span = document.createElement('span');
        $('.spelling_border1')[0].appendChild(span);
        span.innerHTML = '' + arr[1];
    }
    //});

    $scope.check_odd_one_out = function($event) {
        if ($($event.target).hasClass('spelling_Button')) {
            $('.btn_sel').addClass('btn-outline-primary').removeClass('btn-primary');
            $('.spelling_Button.selected').removeClass('selected btn_sel');
            var btnText = $($event.target).text();
            $('.ans').html(btnText);
            $($event.target).addClass('selected btn_sel');
            $($event.target).addClass('btn-outline-primary').removeClass('btn-primary');
            $('.ans').css('border', 'none');
            $('.ans').css('padding', '0 0');
            $('.spelling_border1').addClass('spelling_border');
            $scope.submit();
        }
    };
    $rootScope.totalScore++;
    $scope.submit = function($event) {
        //console.log('in');
        //$rootScope.totalScore++;
        var value = $('.spelling_Button.selected').parents().attr('data-ans');
        //$('.selected').parent().find("div[data-ans='"+value+"']").show();
        $('.disabler_div_spelling').css('display', 'block');
        //$($event.target).addClass('disable');
        $scope.submit = function() {}
        $('.img_feedback_spell').css('display', 'block');

        if (value == 'false') {
            $('.spelling_border1').css('border-color', 'red');
            $('.img_feedback_spell').css('background-position', '-15px -59px')
        } else {
            $rootScope.score++;
        }
        $scope.cal_percentage();
        $scope.get_score();
    };


});


angular.module('myApp.Snap_Ctrl', []).controller('Snap_Ctrl', function($scope, $rootScope, $http, $interval) {

    window.answer = '';

    var key = $rootScope.key;
    var lang = $rootScope.lang;
    var index = $rootScope.index;
    $rootScope.mainAns = true;

    data = $rootScope.ex_data['snap'][index][lang][0]['act'][$rootScope.cnt];
    //$http.get('json/snap.json').success(function(data) {
    $scope.words = shuffleArray(data.data.slice(0));


    $scope.feedbacks = data.feedbacks.slice(0);

    $scope.countC = 0;
    $scope.time = 0.60;
    $rootScope.actFeedback = 'You answered 0 out of 4 questions correctly.';


    var canvas, stage, exportRoot;
    canvas = document.getElementById("canvas");
    exportRoot = new lib.anim_yes_no();

    stage = new createjs.Stage(canvas);
    stage.addChild(exportRoot);
    stage.update();

    createjs.Ticker.setFPS(lib.properties.fps);
    createjs.Ticker.addEventListener("tick", stage);

    setTimeout(function() {
        stage.enableMouseOver(15);
    }, 1000);

    $rootScope.timerInt = setInterval(function() {
        $scope.checkDirty();
    }, 500);

    $scope.closePopup = function($event) {
        $('.blackPatch').fadeOut(300);
        $scope.quit();
    };
    //});


    $scope.checkDirty = function() {
        //console.log('in::' + window.answer);
        $('.main_wrapper').trigger('click');
        if (window.answer == 'yes') {
            setTimeout($scope.submit('true'), 1000);
            clearInterval($rootScope.timerInt);
        } else if (window.answer == 'no') {
            setTimeout($scope.submit('false'), 1000);
            clearInterval($rootScope.timerInt);
        }
        // console.log(window.answer);
    }
    $scope.time = $rootScope.snap_timer;
    //console.log($scope.time + '::' + $rootScope.snap_timer);

    var time = ($scope.time).toFixed(2).toString().split('.');
    if (typeof time[1] == 'undefined') {
        time[1] = 0;
    }
    $('.timer').text(time[0] + ':' + time[1]);

    $scope.startTimer = function() {
        if ($scope.countC == 0) {
            $scope.countC++;
            clearInterval($rootScope.snap_stop);
            $rootScope.snap_stop = setInterval(function() {
                var time = ($scope.time).toFixed(2).toString().split('.');
                if (typeof time[1] == 'undefined') {
                    time[1] = 0;
                }
                $scope.time = (Number(time[0]) * 60) + (parseInt(time[1]));

                //
                if ($scope.time.toFixed(2) <= 0.01) {
                    //$interval.cancel(stop);

                    //clearInterval($rootScope.snap_stop);
                    clearInterval($rootScope.timerInt);
                    $('.blackPatch .alertMsg').html('Out of time!');
                    $('.blackPatch').fadeIn(300);
                    $('.disabler_div_snap').fadeIn(300);
                    //console.log('in2');
                    return false;
                }

                $scope.time -= 1;

                if (($scope.time % 60).toString().length == 1) {
                    time[1] = '0' + $scope.time % 60;
                } else {
                    time[1] = $scope.time % 60;
                }
                time[0] = Math.floor($scope.time / 60);
                $scope.time = Number(time[0] + '.' + time[1]);
                $('.timer').text(time[0] + ':' + time[1]);
                $rootScope.snap_timer = $scope.time;
                //console.log('in time::' + $rootScope.snap_timer);
            }, 1000);
        }
    };
    $scope.startTimer();
    $rootScope.totalScore++;
    $scope.submit = function(value) {
        //$rootScope.totalScore++;
        var value = $scope.feedbacks[2].correctAns;

        //clearInterval($rootScope.snap_stop);
        clearInterval($rootScope.timerInt);
        $('.disabler_div_snap').css('display', 'block');
        if (value.toLowerCase() == lastClicked.toLowerCase()) {
            //console.log('iffff');
            $rootScope.score = $rootScope.score + 1;
            $('.img_feedback_snap').css('display', 'block');
        } else {
            //console.log('elseee');
            $('.correctAns.snap').css('display', 'block');
            $('.img_feedback_snap').css('display', 'block');
            $('.img_feedback_snap').css('background-position', '-15px -59px');
        }
        $scope.cal_percentage();
        $scope.get_score();
    };

});


angular.module('myApp.stressCtrl', ['ngAnimate', 'ngDragDrop']).controller('stressCtrl', function($scope, $rootScope, $http, $interval) {
    var key = $rootScope.key;
    var lang = $rootScope.lang;
    var index = $rootScope.index;
    $rootScope.mainAns = true;

    data = $rootScope.ex_data['sorting'][index][lang][0]['act'][$rootScope.cnt];
    //$http.get('json/stress.json').success(function(data) {
    $scope.titles = data.title;
    $scope.words = [];
    $scope.ogWords = data.words;
    //$rootScope.totalScore += $scope.ogWords.length;
    var size = Math.round($scope.ogWords.length / $scope.titles.length);
    var grp = 0;
    $scope.ogWords = shuffleArray($scope.ogWords);
    for (var i = 0; i < $scope.titles.length; i++) {
        $scope.words.push($scope.ogWords.slice(0).splice(grp, size));
        grp += size;
    }

    $scope.audio = data.audio;
    $scope.sentance = '';
    //setTimeout(function() {
        $('.simAudio').bind("play", function() {
            $(this).closest('.wSpeaker').addClass('selected');
        });
        $('.simAudio').bind("ended", function() {
            $(this).closest('.wSpeaker').removeClass('selected');
        });
    //}, 300);
    //});
    $scope.dragged = null;
    $scope.dropCallback = function(ui) {
        $(ui.target).append($scope.dragged.css({
            'top': '',
            'left': ''
        }));
    };
    $scope.startCallback = function(event, ui, title) {
        $(ui.helper).addClass('selected');
        $scope.dragged = $(ui.helper);
    }

    $rootScope.actFeedback = 'You answered 0 out of ' + $scope.quesNum + ' questions correctly.';
    $scope.time = 2.00; //need to change to 2.00

    $scope.playAudio = function($event) {
        var playB = $($event.target).find('.simAudio')[0];
        var tar = $($event.target);
        if (tar.hasClass('selected')) {
            tar.removeClass('selected');
            playB.pause();
        } else {
            //tar.addClass('selected');
            playB.play();
        }
    };
    $rootScope.totalScore += $scope.ogWords.length;
    $scope.submit = function() {
        //$rootScope.totalScore += $scope.ogWords.length;
        $('.dropConainer').each(function(i) {
            $(this).find('.draggable').each(function() {
                if ($(this).attr('data-box') == (i + 1)) {
                    $(this).addClass('right');
                    $rootScope.score += 1;
                } else {
                    $(this).addClass('wrong');
                }
            });
        });

        $scope.ansC = 0;
        $('.simSound .Actdisabler').show();
        $scope.submit = function() {}
        $('.submit').attr('disabled', true);
        $scope.cal_percentage();
        $scope.get_score();
    };

});

angular.module('myApp.Odd1Out_Ctrl', []).controller('Odd1Out_Ctrl', function($scope, $rootScope, $http, $interval) {
    var key = $rootScope.key;
    var lang = $rootScope.lang;
    var index = $rootScope.index;
    $rootScope.mainAns = true;

    data = $rootScope.ex_data['odd_one_out'][index][lang][0]['act'][$rootScope.cnt];
    //$http.get('json/odd_one_out.json').success(function(data) {
    $scope.words = shuffleArray(data.data.slice(0));
    $scope.question = data.question[0];
    $('.submit').attr('disabled', true);
    //$('.submit').css('cursor', 'default');
    $('.ul_cls_oddOut').css('opacity', '0');
    setTimeout(function() {
        $('.ul_cls_oddOut').css('width', ($('.li_cls').width() * 2 + 15) + 'px');
        $('.ul_cls_oddOut').css('opacity', '1');
    }, 500);
    //});
    $scope.check_odd_one_out = function($event) {
        //$($event.target).parents('.ul_cls').find('.odd_Button').removeClass('selected');
        if ($($event.target).hasClass('odd_Button')) {
            $('.btn_sel').css({'background-color': 'var(--bs-primary)', 'color': '#FFFFFF'});
            $('.odd_Button.selected').removeClass('selected btn_sel');
            $($event.target).addClass('selected btn_sel');
            $($event.target).css({'background-color': 'var(--bs-body-bg)', 'color': 'var(--bs-primary-text)'});
            $('.submit').attr('disabled', false);
            //$('.submit').css('cursor', 'pointer');

        }
    };
    $scope.isSubmitDisabled = false;
    $rootScope.totalScore++;
    $scope.submit = function($event) {
        //$rootScope.totalScore++;
        if (!$('.submit').attr('disabled')) {
            var value = $('.odd_Button.selected').parents().attr('data-ans');
            $('.odd_Button.selected').parent().find("div[data-ans='" + value + "']").addClass(value).show();
            $('.disabler_div').css('display', 'block');
            //        $scope.submit = function() {
            //        }
            $scope.isSubmitDisabled = true;
            //        var element = $('.submit');
            //        angular.element( element ).scope().$destroy();

            $($event.target).addClass('disable');
            $($event.target).css('cursor', 'default');
            //$('.selected').parent().find('.submit').addClass('disable');
            //console.log("value : "+value);
            if (value == 'true') {
                $rootScope.score++;
                $('.odd_Button.selected').addClass('correct_selected');
            } else {
                $('.odd_Button.selected').addClass('wrong_selected');
                $('.correctAns.odd1out').css('display', 'block');
            }
            $('.odd_Button.selected').removeClass('selected');
            $scope.cal_percentage();
            $scope.get_score();
            return false;
        }
    }
});

angular.module('myApp.dectation', ['ngAnimate']).controller('dectation', function($scope, $rootScope, $http, $interval) {
    //$http.get('json/dectation.json').success(function(data) {
    var key = $rootScope.key;
    var lang = $rootScope.lang;
    var index = $rootScope.index;

    data = $rootScope.ex_data['dictation'][index][lang][0]['act'][$rootScope.cnt];

    $scope.words = data.words.slice(0);
    $scope.ogWords = data.words;
    $scope.quesNum = $scope.ogWords.length;
    $scope.audio = data.audio;
    $scope.textBox = [];
    $scope.textBox_size = [];
    $scope.sentance = '';

    //$scope.show_ans = $scope.words[1]['textbox'].split('||')[0];

    $rootScope.mainAns = true;
    for (var i in $scope.words) {
        if ($scope.words[i].textbox) {
            $scope.show_ans = $scope.words[i]['textbox'].split('||')[0]; // to display answer only.
            $scope.textBox.push($scope.words[i].textbox.split('||')[0]);
            //$scope.textBox_size.push($scope.words[i].textbox.split('||')[1]);
            $scope.sentance += ' ' + $scope.words[i].textbox.split('||')[0];
            //$rootScope.totalScore++;
        } else {
            $scope.sentance += ' ' + $scope.words[i].value;
        }
    }

    setTimeout(function() {
        for (var i in $scope.textBox) {
            var w = $scope.textBox[i].length;
            $('.textBoxDiv input').eq(i).width(w * 15);
        }
        
        var total_width = $('.dragContainer').width();
        var input_width = $('.textBoxDiv input').width();

        var max_width = (total_width * 80) / 100;
        //console.log($('.textBoxDiv').find('input').length);
        $('.textBoxDiv').find('input').css('max-width', max_width + 'px');
        $('.dectationAudio').bind("play", function() {
            $(this).closest('.speaker').addClass('selected');
        });
        $('.dectationAudio').bind("ended", function() {
            $(this).closest('.speaker').removeClass('selected');
        });
    }, 0);
    //});

    $rootScope.actFeedback = 'You answered 0 out of ' + $rootScope.ex_data['dictation'][index][lang][0]['act'].length + ' questions correctly.';
    $scope.time = 2.00;

    $scope.playAudio = function($event) {
        //var playB = $($event.target).find('.dectationAudio')[0];
        var playB = $($event.target).find('audio');
        var tar = $($event.target);
        if (tar.hasClass('selected')) {
            //tar.removeClass('selected');
            //playB.pause();
            //playB.get(0).pause();
        } else {
            //tar.addClass('selected');
            //playB.play();
            playB.get(0).play();
        }
    };
    $rootScope.totalScore++;
    $scope.submit = function() {
        //$rootScope.totalScore++;
        //$('.dect_rw_response').addClass('show');
        $scope.ansC = 0;
        for (var i in $scope.textBox) {
            var left_txt = $scope.textBox[i].trim().replace(/[^a-zA-Z ]/g, "");
            var right_txt = $('.textBoxDiv').eq(i).find('input').val().trim().replace(/[^a-zA-Z ]/g, "");

            if (left_txt.toLowerCase() == right_txt.toLowerCase()) {
                $('.textBoxDiv').eq(i).addClass('right');
                $('.textBoxDiv input').addClass('is-valid');
            } else {
                $('.textBoxDiv').eq(i).addClass('wrong');
                $('.textBoxDiv input').addClass('is-invalid');
            }
        }
        //$('.dragContainer').css('margin-top', '-5px');
        if ($('.textBoxDiv.wrong').length > 0) {
            $('.correctAns').show();
        } else {

        }
        $rootScope.score += $('.textBoxDiv.right').length;
        $('.textBoxDiv input').attr('readonly', true);
        $('.submit').attr('disabled', true);

        $scope.submit = function() {}
        $('.submit').attr('disabled', true);
        $scope.cal_percentage();
        $scope.get_score();
    };

});


angular.module('myApp.dragMatchCtrl', ['ngAnimate', 'ngDragDrop']).controller('dragMatchCtrl', function($scope, $rootScope, $http, $interval) {

    var key = $rootScope.key;
    var lang = $rootScope.lang;
    var index = $rootScope.index;
    $rootScope.mainAns = true;

    data = $rootScope.ex_data['matchup'][index][lang][0]['act'][$rootScope.cnt];

    //$http.get('json/drag_match.json').success(function(data) {

    $scope.words = shuffleArray(data.words.slice(0));
    $scope.ogWords = data.words;
    $scope.quesNum = $scope.ogWords.length


    //for refresh
    for (var i in $scope.ogWords) {
        $scope.ogWords[i].drag = true;
    }
    $('.dragMatch .draggable').each(function(i) {

        $scope.ogWords[i].drag = true;
        $scope.dragging = true;
    });
    //for refresh


    $scope.audios = data.audio;
    //setTimeout(function() {
        $('.reorderAudio').bind("play", function() {
            $(this).closest('.wSpeaker').addClass('selected');
        });
        $('.reorderAudio').bind("ended", function() {
            $(this).closest('.wSpeaker').removeClass('selected');
        });
    //}, 300);
    //});

    $scope.countC = 0;
    $scope.quesNum = 0;
    $rootScope.actFeedback = 'You answered 0 out of ' + $scope.quesNum + ' questions correctly.';
    $scope.time = 2.00;
    $scope.dragging = false;

    $scope.playAudio = function($event) {
        //var playB = $($event.target).find('.reorderAudio')[0];
        var playB = $($event.target).find('audio');
        var tar = $($event.target);
        if (tar.hasClass('selected')) {
            tar.removeClass('selected');
            playB.get(0).pause();
        } else {
            //tar.addClass('selected');
            playB.get(0).play();
        }
    };



    $scope.join_drag = function($event) {
        /*var i = $($event.target).index('.draggable');
         console.log(i);
         if (!$scope.dragging) {
         if ($($event.target).parent().hasClass('joined')) {
         $($event.target).parent().css('margin-left', '').removeClass('joined');
         $($event.target).css('background', '');
         $($event.target).parent().css('background', '');
         $scope.ogWords[i].drag = true;

         } else {
         $($event.target).parent().css('margin-left', '-27px').addClass('joined');
         $scope.ogWords[i].drag = false;
         }

         }
         $scope.dragging = false;

         */
    }
    $rootScope.totalScore += $scope.ogWords.length;
    $scope.submit = function() {
        //$rootScope.totalScore += $scope.ogWords.length;
        $('.droppable ').css('margin-left', '-27px').addClass('joined');
        setTimeout(function() {

            $scope.join_drag = function($event) {};
            for (var i in $scope.ogWords) {
                $scope.ogWords[i].drag = false;
            }
            $('.dragMatch .draggable').each(function(i) {

                $scope.ogWords[i].drag = false;
                $scope.dragging = false;
            });
            $scope.ansC = 0;
            //$rootScope.score = 0;


            for (var i in $scope.ogWords) {
                if ($('.draggable').eq(i).parent().hasClass('joined')) {

                    if ($scope.ogWords[i].text.trim() == $('.draggable').eq(i).attr('data-content').trim()) {
                        $scope.ansC++;
                        $rootScope.score++;
                        $('.draggable').eq(i).css('background', 'none');
                        $('.draggable').eq(i).parent().css('width', '203px');
                        $('.draggable').eq(i).parent().css('background', 'url(images/drag_match_bg.png) no-repeat 0 0px');
                    } else {
                        $('.draggable').eq(i).css('background', 'none');
                        $('.draggable').eq(i).parent().css('width', '203px');
                        $('.draggable').eq(i).parent().css('background', 'url(images/drag_match_bg.png) no-repeat 0 -66px');
                    }
                }
            }
            $rootScope.actFeedback = 'You answered ' + $scope.ansC + ' out of ' + $scope.quesNum + ' questions correctly.';
            $('.submit').attr('disabled', true);
            $scope.submit = function() {}
            $scope.cal_percentage();
            $scope.get_score();
        }, 700);

    };

    $scope.startCallback = function(event, ui, title) {
        if ($(event.target).parent().hasClass('joined')) {
            $('.draggable').trigger('mouseup');
            return false;
        }
        $scope.draggable = $(ui.helper);
        $scope.dragParent = $(ui.helper).parent();
        $scope.dragging = true;
    };

    $scope.stopCallback = function(event, ui) {
        //console.log('Why did you stop draggin me?');
    };

    $scope.dragCallback = function(event, ui) {
        //console.log('hey, look I`m flying');
    };

    $scope.dropCallback = function(event, ui) {
        //console.log('hey, you dumped me :-(', $scope.draggedTitle);
        var a = $(event.target).text();
        $scope.draggable.css({
            'left': '',
            'top': ''
        });

        var old_attr = $(event.target).find('div').attr('data-content');

        $(event.target).find('div').attr('data-content', $scope.draggable.attr('data-content')).html($scope.draggable.text());
        $scope.draggable.attr('data-content', old_attr);
        $scope.draggable.html(a);

        //$(event.target).css('background-color', 'green')
    };

    $scope.overCallback = function(event, ui) {

    };

    $scope.outCallback = function(event, ui) {
        //console.log('I`m not, hehe');
    };
});

angular.module('myApp.reorderingCtrl', ["ngDragDrop"]).controller('reorderingCtrl', function($scope, $rootScope, $http, $interval) {
    var key = $rootScope.key;
    var lang = $rootScope.lang;
    var index = $rootScope.index;
    $rootScope.mainAns = true;

    data = $rootScope.ex_data['reordering'][index][lang][0]['act'][$rootScope.cnt];
    //$http.get('json/reordering.json').success(function(data) {

    var og_data = data.data.slice(0)[0]['value'];
    $scope.words = shuffleArray(data.data.slice(0))[0]['value'].split(' ');

    if ($scope.words.length == 1) {
        var s = $scope.words.toString();
        $scope.words = new Array();
        for (var i = 0; i < s.length; i++) {
            $scope.words[i] = s.charAt(i);
        }
    }
    var s_temp = $scope.words.slice(0);
    for (var i = 0; i < s_temp.length; i++) {
        $scope.words[i] = {
            "value": s_temp[i]
        }
    }
    $scope.words = shuffleArray($scope.words.slice(0));
    $scope.audio = {};
    $scope.audio.src = data.audio.src;
    $scope.sentanceAns = data.answer[0];
    $scope.sentance = '';
    for (var i in $scope.words) {
        $scope.sentance += " " + $scope.words[i].value;
    }

    //$rootScope.totalScore++;

    setTimeout(function() {
        $('.dragContainer').sortable()
    }, 500)
    //});

    $scope.closePopup = function($event) {
        $('.blackPatch').fadeOut(300);
        $('.accordion_content.review').prev().trigger('click');
        $('.disabler').show();
        $('.tpl_btn').attr('disabled', true);
        //$interval.cancel(stop);
        clearInterval($rootScope.reorder_timer);
    };


    $scope.playAudio = function($event) {
        /*var playB = $($event.target);
         if (playB.hasClass('selected')) {
         playB.removeClass('selected');
         document.getElementById('reorderAudio').pause();
         } else {
         //playB.addClass('selected');
         document.getElementById('reorderAudio').play();
         }*/

        var playB = $($event.target).find('audio');
        var tar = $($event.target);
        if (tar.hasClass('selected')) {
            //tar.removeClass('selected');
            //playB.pause();
            //playB.get(0).pause();
        } else {
            //tar.addClass('selected');
            //playB.play();
            playB.get(0).play();
        }

    };
    $('#reorderAudio').bind("play", function() {
        $(this).closest('.speaker').addClass('selected');
    });
    $('#reorderAudio').bind("ended", function() {
        $(this).closest('.speaker').removeClass('selected');
    });
    $scope.countC = 0;
    $scope.time = $rootScope.reordering_timer;


    var time = ($scope.time).toFixed(2).toString().split('.');
    if (typeof time[1] == 'undefined') {
        time[1] = 0;
    }
    $('.timer').text(time[0] + ':' + time[1]);

    $rootScope.actFeedback = 'You answered 0 out of 4 questions correctly.';

    $scope.startTimer = function() {
        if ($scope.countC == 0) {
            $scope.countC++;

            if ($rootScope.reorder_timer) {
                clearInterval($rootScope.reorder_timer);
            }
            $rootScope.reorder_timer = setInterval(function() {
                var time = ($scope.time).toFixed(2).toString().split('.');
                if (typeof time[1] == 'undefined') {
                    time[1] = 0;
                }
                $scope.time = (Number(time[0]) * 60) + (parseInt(time[1]));
                //
                if ($scope.time.toFixed(2) <= 0.01) {
                    //$interval.cancel(stop);
                    clearInterval($rootScope.reorder_timer);
                    $('.blackPatch .alertMsg').html('Out of time!');
                    $('.blackPatch').fadeIn(300);
                    $('.timer').text($scope.time);
                    return false;
                }

                $scope.time -= 1;

                if (($scope.time % 60).toString().length == 1) {
                    time[1] = '0' + $scope.time % 60;
                } else {
                    time[1] = $scope.time % 60;
                }
                time[0] = Math.floor($scope.time / 60);
                $scope.time = Number(time[0] + '.' + time[1]);
                $('.timer').text(time[0] + ':' + time[1]);
                $rootScope.reordering_timer = $scope.time;
            }, 1000);
        }
    };
    $scope.dropCallback = function(event, ui, title, $index) {

        $scope.words.map(function(item) {
            return item.value;
        });
    };
    $rootScope.totalScore++;
    $scope.submit = function() {
        //$rootScope.totalScore++;
        setTimeout(function() {
            var sentance = '';
            var sentence_status = false;
            $('.dragContainer li .drag').each(function() {
                if ($(this).text().trim().length == 1) {
                    sentance += $(this).text().trim();

                } else {
                    sentance += ' ' + $(this).text().trim();
                    sentence_status = true;

                }

            });

            if (sentence_status) {
                sentance = '';
                $('.dragContainer li .drag').each(function() {
                    sentance += ' ' + $(this).text().trim();
                });
            }


            $scope.sentance = sentance;

            if (sentance.trim() == og_data.trim()) {
                $rootScope.score += 1;
                //$interval.cancel(stop);
                clearInterval($rootScope.reorder_timer);
                $('.dragContainer').fadeOut(300, function() {
                    $('.sentanceC').fadeIn(300);
                });
            } else {
                //$interval.cancel(stop);
                clearInterval($rootScope.reorder_timer);
                $('.dragContainer').fadeOut(300, function() {
                    $('.sentance').html(sentance).css('border-color', '#d50000');
                    $('.sentanceC').fadeIn(300).css('background-image', 'url(images/reorder_wrong_tick.png)');
                    $('.correctAns').fadeIn(300);
                });
            }
            $scope.cal_percentage();
            $scope.get_score();
        }, 300);
        $('.submit').attr('disabled', true);

    };
});

angular.module('myApp.memoryCtrl', ['ngRoute']).controller('memoryCtrl', function($scope, $rootScope, $http, $interval, $templateCache, $route) {
    var key = $rootScope.key;
    var lang = $rootScope.lang;
    var index = $rootScope.index;

    var data = $rootScope.ex_data['memory_match'][index][lang][0]['act'][$rootScope.cnt];
    //$http.get('json/data.json').success(function(data) {

    $scope.cards = shuffleArray(data.data);
    //$scope.instruction = data.instructions[0].text;
    $scope.pairs = ($scope.cards.length / 2);
    $rootScope.actFeedback = 'You correctly matched 0 out of ' + ($scope.cards.length / 2) + ' pairs.';
    $rootScope.totalScore += $scope.pairs;
    $rootScope.mainAns = false;
    //});

    $scope.closePopup = function($event) {
        $('.blackPatch').fadeOut(300);
        $('.accordion_content.review').prev().trigger('click');
        $('.tpl_btn').attr('disabled', true);
        $('.disabler').show();
        //$interval.cancel(stop);
        clearInterval($rootScope.memery_match_timer);
    };


    $scope.animating = false;
    $scope.matchedNum = 0;
    $rootScope.actFeedback = 'You correctly matched 0 out of 4 pairs.';
    $scope.countC = 0;
    $scope.time = 4; //original value: 5, nefted because of faster anim

    var _time = ($scope.time).toFixed(2).toString().split('.');
    if (typeof _time[1] == 'undefined') {
        _time[1] = 0;
    }
    $('.timer').text(_time[0] + ':' + _time[1]);

    $scope.rotate = function($event, value, index) {
        if ($scope.countC == 0) {
            $scope.countC++;


            $rootScope.memery_match_timer = setInterval(function() {
                var time = ($scope.time).toFixed(2).toString().split('.');
                if (typeof time[1] == 'undefined') {
                    time[1] = 0;
                }
                $scope.time = (Number(time[0]) * 60) + (parseInt(time[1]));
                //
                if ($scope.time.toFixed(2) <= 0.01) {
                    //$interval.cancel(stop);
                    clearInterval($rootScope.memery_match_timer);
                    $('.blackPatch .alertMsg').html('Out of time!');
                    $('.blackPatch').fadeIn(300);
                    return false;
                }

                $scope.time -= 1;

                if (($scope.time % 60).toString().length == 1) {
                    time[1] = '0' + $scope.time % 60;
                } else {
                    time[1] = $scope.time % 60;
                }
                time[0] = Math.floor($scope.time / 60);
                $scope.time = Number(time[0] + '.' + time[1]);
                $('.timer').text(time[0] + ':' + time[1]);
            }, 1000);

        }
        if ($($event.target).parent().hasClass('selected') || $($event.target).parent().hasClass('correct') || $scope.animating) {
            return false;
        }

        $scope.animating = true;
        $($event.target).parent().addClass('selected');
        $scope.match = false;
        if (typeof $scope.clicked != 'undefined') {
            if ($scope.value == value) {
                $scope.match = true;
                $scope.value = null;
                value = null;
                setTimeout(function() {
                    $('.selected .response_ico').fadeIn(300);
                    $('.selected').addClass('correct').removeClass('selected');
                    if ($scope.time > 0) {
                        $scope.matchedNum++;
                        $rootScope.score++;
                        if ($scope.pairs == $scope.matchedNum) {
                            $('.try_again').hide();
                            $('.blackPatch .alertMsg').html('Well done!');
                            clearInterval($rootScope.memery_match_timer);
                            setTimeout(function() {
                                $('.blackPatch').fadeIn(300);
                            }, 1000);
                        }
                    }
                    $rootScope.actFeedback = 'You correctly matched ' + $scope.matchedNum + ' out of ' + ($scope.cards.length / 2) + ' pairs.';
                }, 500);
                setTimeout(function() {
                    $scope.animating = false;
                }, 800);
            } else {
                setTimeout(function() {
                    if ($('.selected').length >= 2) {
                        $scope.value = null;
                        $('.selected').addClass('red');
                        $scope.animating = true;
                        setTimeout(function() {
                            $('.selected').each(function() {
                                setTimeout(function() {
                                    $('.red').removeClass('red');
                                    $scope.animating = false;
                                }, 400);
                                revertRotateDiv(this, 25, 90); //make anim faster
                                $(this).removeClass('selected');
                            });
                        }, 1500);

                    } else {
                        setTimeout(function() {
                            $scope.animating = false;
                        }, 400);
                    }
                }, 80);

            }
        } else {
            $scope.clicked = index;
            setTimeout(function() {
                $scope.animating = false;
            }, 80);
        }

        $scope.value = value;
        rotateDiv($event.target, 25, 90); //make anim faster, original value: 40, 90

    };


});



function shuffle(o) { //v1.0
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x)
    ;
    return o;
}
var _incParam = 10;

function rotateDiv(elem, speed, degree) {
    elem = $(elem).parent();
    var d = 0;
    var firstRotation = false;

    var r = setInterval(function() {

        if (firstRotation == false) {
            elem.find('.front').css({
                "-webkit-transform": "rotateY(" + d + "deg)",
                "-moz-transform": "rotateY(" + d + "deg)",
                "-ms-transform": "rotateY(" + d + "deg)",
                "-o-transform": "rotateY(" + d + "deg)",
                "transform": "rotateY(" + d + "deg)",
            });
            d = d + _incParam;

        } else {
            elem.find('.back').css({
                "-webkit-transform": "rotateY(" + d + "deg)",
                "-moz-transform": "rotateY(" + d + "deg)",
                "-ms-transform": "rotateY(" + d + "deg)",
                "-o-transform": "rotateY(" + d + "deg)",
                "transform": "rotateY(" + d + "deg)",
            });

            d = d - _incParam;
        }

        if (d > degree) {
            firstRotation = true;
        }

        if (firstRotation == true && d == 0) {
            clearInterval(r);
            $(elem).find('.back').css({
                "-webkit-transform": "rotateY(0deg)",
                "-moz-transform": "rotateY(0deg)",
                "-ms-transform": "rotateY(0deg)",
                "-o-transform": "rotateY(0deg)",
                "transform": "rotateY(0deg)",
            });
        }
    }, speed);
}

function revertRotateDiv(elem, speed, degree) {
    var d = 0;
    var firstRotation = false;
    var r = setInterval(function() {
        if (firstRotation == false) {
            $(elem).find('.back').css({
                "-webkit-transform": "rotateY(" + d + "deg)",
                "-moz-transform": "rotateY(" + d + "deg)",
                "-ms-transform": "rotateY(" + d + "deg)",
                "-o-transform": "rotateY(" + d + "deg)",
                "transform": "rotateY(" + d + "deg)",
            });
            d = d + _incParam;

        } else {
            $(elem).find('.front').css({
                "-webkit-transform": "rotateY(" + d + "deg)",
                "-moz-transform": "rotateY(" + d + "deg)",
                "-ms-transform": "rotateY(" + d + "deg)",
                "-o-transform": "rotateY(" + d + "deg)",
                "transform": "rotateY(" + d + "deg)",
            });

            d = d - _incParam;
        }

        if (d > degree) {
            firstRotation = true;
        }

        if (firstRotation == true && d == 0) {
            clearInterval(r);
            $(elem).find('.front').css({
                "-webkit-transform": "rotateY(0deg)",
                "-moz-transform": "rotateY(0deg)",
                "-ms-transform": "rotateY(0deg)",
                "-o-transform": "rotateY(0deg)",
                "transform": "rotateY(0deg)",
            });
        }


    }, speed);
}
var shuffleArray = function(array) {
    var m = array.length,
        t, i;

    // While there remain elements to shuffle
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}
$(document).ready(function() {
    function hasGetUserMedia() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
    }

    if (hasGetUserMedia()) {
        //alert('supported in your browser');
    } else {
        console.log('getUserMedia() is not supported in your browser');
    }

});

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

$('.imgpop').on('click', function() {
    $('#imagemodal').modal('show');
});