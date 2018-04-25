var project_xml_data = new Object();
var project_count = 0;
var load_count = 0;
$.ajax({
    type: "GET",
    url: "xml/project_list.xml",
    dataType: "xml",
    success: function(xml) {
        $(xml).find('Project').each(function(e) {
            var project_name = $(this).find('Name').text();
            var file_name = $(this).find('File').text();
            var object_name = $(this).find('Code').text();
            project_xml_data[project_count] = {'project_name': project_name, 'file_name': file_name, 'object_name': object_name};
            project_count++;
        });
        loadXML();
    },
    error: function() {
        alert("An error occurred while processing XML file.");
    }
});
function loadXML() {
    if (load_count < project_count) {
        $.ajax({
            type: "GET",
            url: "xml/" + project_xml_data[load_count]['file_name'],
            dataType: "xml",
            success: function(xml) {
                project_xml_data[load_count]['xml_data'] = xml;
                load_count++;
                loadXML();
            },
            error: function() {
                alert("An error occurred while processing XML file.");
            }
        });
        if ((project_count - load_count) === 1) {
            loadFramework();
        }
    }
}
function loadFramework() {
    $.ajax({
        type: "GET",
        url: "xml/frameworks.xml",
        dataType: "xml",
        success: function(xml) {
            $(xml).find('framework').each(function() {
                for (var key in project_xml_data) {
                    if (project_xml_data[key]['object_name'] == $(this).attr('code')) {
                        project_xml_data[key]['framework_model'] = $(this).attr('model');
                        project_xml_data[key]['framework_summery'] = $(this).attr('summary');
                        project_xml_data[key]['framework_enabled'] = $(this).attr('enabled');
                    }
                }
            });
            loadXML_finish();
        },
        error: function() {
            alert("An error occurred while processing XML file.");
        }
    });
}
function loadXML_finish() {
    var project_html = '';
    for (var key in project_xml_data) {
        if (project_xml_data[key]['framework_model'] === 'y' && project_xml_data[key]['framework_enabled'] === 'true') {
            project_html = project_html + '<li title="' + project_xml_data[key]['framework_summery'] + '" data-key="' + key + '">' + project_xml_data[key]['project_name'] + '</li>';
        }
    }
    $('#left_project_list ul').append(project_html);
    $('#left_project_list li').on('click', function() {
        $('#guide_list ul').empty();
        $('#guide_list_data_head').empty();
        $('#guide_list_data_body').empty();

        var guided_html = '';
        var _this = this;
        $(project_xml_data[$(this).attr('data-key')]['xml_data']).find('step').each(function() {
            guided_html = guided_html + '<li data-key="' + $(_this).attr('data-key') + '" data-para_ids="' + $(this).attr('para_ids') + '">' + $(this).attr('label') + '</li>';
        });
        $('#guide_list ul').append(guided_html);
        $('#guide_list li').on('click', function() {

            var _this_0 = this;
            var top_para = new Array(); //It contains header info.
            var top_para_content = '';
            var para_ids = new Array(); //It contains para ids for body info.
            var body_content = '';
            $('#guide_list_data_head').empty();
            $('#guide_list_data_body').empty();

            if ($(this).attr('data-para_ids') === 'undefined') {
                $(project_xml_data[$(_this).attr('data-key')]['xml_data']).find('step').each(function() {
                    if ($(this).attr('label') == $(_this_0).html()) {
                        $(this).children().find('para').each(function(index) {
                            top_para[index] = $(this).text();
                            top_para_content = top_para_content + '<p>' + $(this).text() + '</p>';
                        });
                        $('#guide_list_data_head').html(top_para_content);
                    }
                });
            } else {
                para_ids = $(_this_0).attr('data-para_ids').toString().split(',');

                for (var i = 0; i < para_ids.length; i++) {
                    para_ids[i] = para_ids[i].split('_');
                    para_ids[i] = para_ids[i][para_ids[i].length - 1];
                }

                para_ids.sort(function(a, b) {
                    return a - b
                });

                $(project_xml_data[$(_this).attr('data-key')]['xml_data']).find('step').each(function() {
                    if ($(this).attr('label') == $(_this_0).html()) {
                        $(this).children().find('para').each(function(index) {
                            top_para[index] = $(this).text();
                            top_para_content = top_para_content + '<p>' + $(this).text() + '</p>';
                        });
                        $('#guide_list_data_head').html(top_para_content);
                    }
                });
                $(project_xml_data[$(_this).attr('data-key')]['xml_data']).find('paragraph').each(function() {

                    for (var i = 0; i < para_ids.length; i++) {

                        if ($(this).children('name').attr('eid')) {
                            var name_node = $(this).children('name').attr('eid').split('_');
                            if (Number(name_node[name_node.length - 1]) === Number(para_ids[i])) {
                                body_content = body_content + '<p>' + $(this).children('name').text() + '</p>';
                            }
                        }

                        if ($(this).children('desc').attr('eid')) {
                            var desc_node = $(this).children('desc').attr('eid').split('_');
                            if (Number(desc_node[desc_node.length - 1]) === Number(para_ids[i])) {
                                body_content = body_content + '<p>' + $(this).children('desc').text() + '</p>';
                            }
                        }

                        if ($(this).children('notes').attr('eid')) {
                            var notes_node = $(this).children('notes').attr('eid').split('_');
                            if (Number(notes_node[notes_node.length - 1]) === Number(para_ids[i])) {
                                body_content = body_content + '<p>' + $(this).children('notes').text() + '</p>';
                            }
                        }

                        if ($(this).children('content').attr('eid')) {
                            var content_node = $(this).children('content').attr('eid').split('_');
                            if (Number(content_node[content_node.length - 1]) === Number(para_ids[i])) {
                                body_content = body_content + '<p>' + $(this).children('content').text() + '</p>';
                            }
                        }
                    }

                });

                $('#guide_list_data_body').html(body_content);
            }
        });
    });
}