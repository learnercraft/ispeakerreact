/*  used ?
function setupExtDoubleClick(websiteUrl, dictionary, showLayer, areaId, maxAllowedWords, target) {
    setupDoubleClick(websiteUrl, dictionary, showLayer, areaId, maxAllowedWords, target,
        function(websiteUrl, dictionary, lookup) { return "http://dictionary.oxford.org/results.asp?searchword=" + lookup; });
}
*/
function setupDoubleClick(websiteUrl, dictionary, showLayer, areaId, maxAllowedWords, target, urlCallback) {
    //warning message for developers
    if (!websiteUrl) {
        alert("Please specify required parameters (websiteUrl) to setupDoubleClick()")
        return;
    }

    var setup = function(e) {
        // don't do anything on A href elements
        // and when this is right button of mouse.
        if (e.target.nodeName.toLowerCase() == "a" || e.button == 2) {
            $("#definition_layer").remove();
            return;
        }
        e.preventDefault();
        var lookup = getSelectedText();
        lookup = lookup.replace(/\uFEFF/g, ""); // zero-width space characters
        lookup = clearStream(lookup);
        //lookup = lookup.replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, " ");
        lookup = lookup.replace(/^\s+/g, "");
        lookup = lookup.replace(/\s+$/g, "");
        lookup = lookup.replace(/\s+/g, " ");
        if (lookup != null && lookup.replace("/\s/g", "").length > 0 && isValidSearchText(lookup)) {
            //disable the double-click feature if the lookup string
            //exceeds the maximum number of allowable words
            if (maxAllowedWords && lookup.split(/[ -]/).length > maxAllowedWords)
                return;
            if (showLayer)
            	displayLayer(e, lookup);
            else
            	openPopup(lookup);
        } else {
            $("#definition_layer").remove();
        }
    };
    
    //display the definition layer
    var displayLayer = function(e, lookup) {
	    //append the layer to the DOM only once
	    if ($("#definition_layer").length == 0) {
	        var imageUrl = websiteUrl + "external/images/doubleclick/definition-layer.gif";
	        $("body").append("<div id='definition_layer' style='position:absolute; cursor:pointer;'><img src='" + imageUrl + "' alt='' title=''/></div>");
	    }
	    
	    //move the layer at the cursor position
	    $("#definition_layer").map(function() {
	        $(this).css({'left' : e.pageX-30, 'top' : e.pageY-40});
	    });
	    
	    //open the definition popup clicking on the layer
        $("#definition_layer").mouseup(function(e) {
            e.stopPropagation();
            openPopup(lookup);
        });
    };

    //opens the definition popup
    var openPopup = function(lookup) {
        var searchUrl;
        if (urlCallback)
            searchUrl = urlCallback(websiteUrl, dictionary, lookup);
        else
            searchUrl = websiteUrl + "search/" + (dictionary ? dictionary + "/" : "") + "?q=" + lookup;
        if (target) {
            var popup = window.open(searchUrl, target, "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=no,copyhistory=no,width=300,height=400,top=300,left=300");
            if (popup)
                popup.focus();
        } else {
            //window.open(searchUrl, 'oaado_lookup');
            var queryString = searchUrl.replace(new RegExp('^.*\\?'), '');
            var params = queryString.split("&");
            var anchor = document.createElement('form');
            anchor.action = searchUrl.replace(new RegExp('\\?.*'), '');
            anchor.method = "GET";
            document.body.appendChild(anchor);
            //alert("."+searchUrl+".\n."+anchor.action+".\n."+queryString+".\n."+params+".");
            for(var i=0;i<params.length;i++){
                var infos = params[i].split('=');
                var input = document.createElement('input');
                input.type = 'hidden';
                input.name = infos[0];
                input.value= infos[1];
                anchor.appendChild(input);
            }
            anchor.submit();
        }
    };
    
    var area = areaId ? "#" + areaId : "body";
	$(area).dblclick(setup);
}

/*
 * Cross-browser function to get selected text
 */
function getSelectedText(){
    if(window.getSelection)
        return window.getSelection().toString();
    else if(document.getSelection)
        return document.getSelection();
    else if(document.selection)
        return document.selection.createRange().text;
    return "";
}
