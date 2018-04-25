(function (lib, img, cjs) {

var p; // shortcut to reference prototypes

// library properties:
lib.properties = {
	width: 116,
	height: 116,
	fps: 24,
	color: "#FFFFFF",
	manifest: []
};

// stage content:
(lib.anim_yes_no = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{start:6});

	// timeline functions:
	this.frame_0 = function() {
		this.startFrame;
		this.endFrame;
		var THIS = this;
		THIS.temp = 100;
		this.rotateAnim = function(framNo, anim_side){
			this.startFrame = framNo;
			if(anim_side == 'left'){
				this.endFrame = 1;
				window.lastClicked = "yes";
			}else {
				this.endFrame = 12;
				window.lastClicked = "no";
			}
			createjs.Ticker.addEventListener("tick", THIS.playReverseAnim);
			//THIS.addEventListener("enterFrame", THIS.playReverseAnim);
		}
		
		this.playReverseAnim = function(e){
			/*trace("startFrame : "+startFrame);
			trace("endFrame : "+endFrame);
			trace("current : "+THIS.currentFrame);*/
			//console.log('Hi i am from playReverseAnim..')
			if(THIS.startFrame<THIS.endFrame){
				//console.log('From If condition '+THIS.currentFrame)
				THIS.gotoAndStop(THIS.currentFrame += 1);
				
			} else if(THIS.startFrame>THIS.endFrame){
				//console.log('From Else condition '+THIS.currentFrame)
				THIS.gotoAndStop(THIS.currentFrame -= 1);
				
			}
			
			if(THIS.currentFrame==THIS.endFrame){
				createjs.Ticker.removeEventListener("tick", THIS.playReverseAnim);
				//THIS.removeEventListener("enterFrame", THIS.playReverseAnim);
				//THIS.stop();
			}
			
			
		}
		THIS.gotoAndStop("start");
	}
	this.frame_1 = function() {
		//var THIS = this;
		//this.no_small_mc.cursor = 'pointer';
		//this.no_small_mc.addEventListener("click", updateAnim_small_no);
		//function updateAnim_small_no(e)
		//{
			//THIS.rotateAnim(THIS.currentFrame, 'right');
		//}
		
		window.answer = 'yes';
	}
	this.frame_6 = function() {
		var THIS = this;
		//console.log('this.yes_mc,....'+this.yes_mc)
		this.yes_mc.cursor = 'pointer';
		this.yes_mc.addEventListener("click", updateAnim);
		function updateAnim(e)
		{
			//console.log('yes,....')
			THIS.rotateAnim(THIS.currentFrame, 'left');
		}
		
		this.no_mc.cursor = 'pointer';
		this.no_mc.addEventListener("click", updateAnim_no);
		function updateAnim_no(e)
		{
			THIS.rotateAnim(7, 'right');
		}
		
		
		
		this.yes_mc.onMouseOver = function(e) {
		    document.body.style.cursor='pointer';
		}
		
		this.yes_mc.onMouseOut = function(e) {
		    document.body.style.cursor='default';
		} 
		
		this.no_mc.onMouseOver = function(e) {
		    document.body.style.cursor='pointer';
		}
		
		this.no_mc.onMouseOut = function(e) {
		    document.body.style.cursor='default';
		}
	}
	this.frame_12 = function() {
		//var THIS = this;
		//this.yes_small_mc.buttonMode=true;
		//console.log("last this.yes_small_mc : "+this.yes_small_mc);
		//this.yes_small_mc.cursor = 'pointer';
		//this.yes_small_mc.addEventListener("click", updateAnim_small_yes);
		//function updateAnim_small_yes(e)
		//{
			//THIS.rotateAnim(THIS.currentFrame, 'left');
		//}
		
		
		window.answer = 'no';
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(5).call(this.frame_6).wait(6).call(this.frame_12).wait(1));

	// Layer 3
	this.no_small_mc = new lib.YL();
	this.no_small_mc.setTransform(84.1,57.3,1.045,1,180,0,0,28,56);

	this.no_mc = new lib.N();
	this.no_mc.setTransform(85.7,58,0.988,1,0,0,180,28,56);

	this.yes_mc = new lib.Y();
	this.yes_mc.setTransform(30,58,1,1,0,0,0,28,56);

	this.yes_small_mc = new lib.YL2();
	this.yes_small_mc.setTransform(29.5,57,1,1,0,0,0,28,56);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.no_small_mc}]},1).to({state:[]},1).to({state:[{t:this.yes_mc},{t:this.no_mc}]},4).to({state:[]},1).to({state:[{t:this.yes_small_mc}]},4).to({state:[]},1).wait(1));

	// Layer 4
	this.instance = new lib.Tween11copy("synched",0);
	this.instance.setTransform(113.2,57.8,0.018,1);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1).to({_off:false},0).to({scaleX:1,x:85.6,y:56.8},5).to({scaleX:1.32,scaleY:1.32,x:59.4,y:56.1},6).wait(1));

	// Layer 5
	this.instance_1 = new lib.Tween11("synched",0);
	this.instance_1.setTransform(29.9,56.8);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(6).to({_off:false},0).to({scaleX:0.02,x:3.1,y:55.8},6).wait(1));

	// Layer 1
	this.instance_2 = new lib.Tween2("synched",0);
	this.instance_2.setTransform(58.5,58.8,1.318,1.318);
	this.instance_2._off = true;

	this.instance_3 = new lib.Tween11("synched",0);
	this.instance_3.setTransform(29.9,56.8);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_2}]},1).to({state:[{t:this.instance_3}]},5).to({state:[]},1).to({state:[]},5).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(1).to({_off:false},0).to({_off:true,scaleX:1,scaleY:1,x:29.9,y:56.8},5).wait(8));

	// Layer 6
	this.instance_4 = new lib.Symbol1("synched",0);
	this.instance_4.setTransform(2.2,2.5,1,1,179.9,0,0,56,56);
	this.instance_4._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(6).to({_off:false},0).wait(7));

	// Layer 7
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#4577BF").ss(1,1,1).p("AGLGLQikCljnAAQjnAAikilQikikAAjnQAAjnCkikQCkikDnAAQDnAACkCkQClCkAADnQAADnilCkg");
	this.shape.setTransform(58,58);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#4577BF").s().p("AmLGLQijikAAjnQAAjmCjikQClikDmAAQDnAACkCkQClCkgBDmQABDnilCkQikCkjnAAQjmAAilikg");
	this.shape_1.setTransform(58,58);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#4577BF").ss(1,1,1).p("An2AAQAAjeCYigQAigkAlgcQCFhlCpgHQBjgFBZAbQBZApBIBqQCBCdACDiQAADqiDCeQhIBjhZAsQhZAahigEQipgHiGhmQglgcghgjQiZigAAjfg");
	this.shape_2.setTransform(52.4,58);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#4577BF").s().p("AAYIrQipgHiGhmQglgcghgjQiZigAAjfQAAjeCYigQAigkAlgcQCFhlCpgHQBjgFBZAbQBZApBIBqQCBCdACDiQAADqiDCeQhIBjhZAsQhNAXhUAAIgagBg");
	this.shape_3.setTransform(52.4,58);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f().s("#4577BF").ss(1,1,1).p("Am+AAQAAjWCOicQAfgiAjgdQB+hlCfgQQBdgJBYAUQBDAqA2B5QBhCZABDgQAADohiCYQg2BshDAuQhXAUhdgIQifgPh/hnQgjgcgfgiQiOidAAjWg");
	this.shape_4.setTransform(46.8,58);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#4577BF").s().p("AAwInQifgPh/hnQgjgcgfgiQiOidAAjWQAAjWCOicQAfgiAjgdQB+hlCfgQQBdgJBYAUQBDAqA2B5QBhCZABDgQAADohiCYQg2BshDAuQg+AOhAAAQgaAAgcgCg");
	this.shape_5.setTransform(46.8,58);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f().s("#4577BF").ss(1,1,1).p("AmGAAQAAjOCDiYQAdghAhgdQB3hmCUgXQBYgOBXAOQAtArAkCHQBACVABDgQAADlhBCSQgkB0gtAxQhWANhWgMQiWgXh4hnQghgdgcghQiEiZAAjOg");
	this.shape_6.setTransform(41.2,58);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#4577BF").s().p("ABJIjQiWgXh4hnQghgdgcghQiEiZAAjOQAAjOCDiYQAdghAhgdQB3hmCUgXQBYgOBXAOQAtArAkCHQBACVABDgQAADlhBCSQgkB0gtAxQgsAHgsAAQgqAAgqgGg");
	this.shape_7.setTransform(41.2,58);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f().s("#4577BF").ss(1,1,1).p("AlOAAQAAjFB4iVQAbggAfgdQBwhnCKgfQBSgSBXAHQAWAsARCWQAhCRAADgQAADhghCMQgSB9gVA0QhVAGhRgQQiMgfhxhoQgfgdgaggQh5iVAAjGg");
	this.shape_8.setTransform(35.6,58);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#4577BF").s().p("ABhIfQiMgfhxhoQgfgdgaggQh5iVAAjGQAAjFB4iVQAbggAfgdQBwhnCKgfQBSgSBXAHQAWAsARCWQAhCRAADgQAADhghCMQgSB9gVA0QgZACgXAAQg8AAg6gMg");
	this.shape_9.setTransform(35.6,58);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f().s("#4577BF").ss(1,1,1).p("AkXAAQAAjnCkikQCiikDpAAQAABSgBHuQAAGxABBuQjpAAiiilQikikAAjng");
	this.shape_10.setTransform(30,58);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#4577BF").s().p("AhzGLQijikAAjnQAAjnCjikQCjikDoAAIgBI/QgBGyACBuQjoAAijilg");
	this.shape_11.setTransform(30,58);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_1},{t:this.shape}]},1).to({state:[{t:this.shape_3},{t:this.shape_2}]},1).to({state:[{t:this.shape_5},{t:this.shape_4}]},1).to({state:[{t:this.shape_7},{t:this.shape_6}]},1).to({state:[{t:this.shape_9},{t:this.shape_8}]},1).to({state:[{t:this.shape_11},{t:this.shape_10}]},1).wait(7));

	// Layer 8
	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f().s("#4577BF").ss(1,1,1).p("AGLGLQikCljnAAQjnAAikilQikikAAjnQAAjnCkikQCkikDnAAQDnAACkCkQClCkAADnQAADnilCkg");
	this.shape_12.setTransform(58,58);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#FFFFFF").s().p("AmLGLQijikAAjnQAAjnCjikQClikDmAAQDnAACkCkQClCkgBDnQABDnilCkQikCljnAAQjmAAililg");
	this.shape_13.setTransform(58,58);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_13},{t:this.shape_12}]},1).wait(12));

	// Layer 10
	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f().s("#FFFFFF").ss(2,1,1).p("AGSGSQinCojrAAQjrAAinioQininAAjrQAAjrCninQCninDrAAQDrAACnCnQCoCnAADrQAADrioCng");
	this.shape_14.setTransform(58,58);
	this.shape_14._off = true;

	this.timeline.addTween(cjs.Tween.get(this.shape_14).wait(1).to({_off:false},0).wait(12));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = null;


// symbols:
(lib.YL2 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(7,7,7,0.008)").s().p("AhzGLQijikgBjnQABjnCjikQCjijDngBIAAABQjqABhkDHQhJCNABDZQAADyCHCnQA7BIBKAnQBCAlBAACQjigCigiig");
	this.shape.setTransform(28,56);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,56,112);


(lib.YL = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(19,162,0,0.008)").s().p("AhzGLQijikgBjnQABjnCjikQCjijDngBIAAABQjqABhkDHQhJCNABDZQAADyCHCnQA7BIBKAnQBCAlBAACQjigCigiig");
	this.shape.setTransform(28,56);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,56,112);


(lib.Y = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(19,162,0,0.008)").s().p("AhzGLQijikgBjnQABjnCjikQCjijDngBIAAI/QAAGyAABtQjnAAijikg");
	this.shape.setTransform(28,56);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,56,112);


(lib.Tween11copy = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#4577BF").s().p("AAgAvQgGgDgFgGQgEgFgCgHQgCgHAAgHQAAgHACgFQACgHAEgFQAFgGAGgDQAGgEAJAAQAJAAAGAEQAHADAEAGQAEAFACAHQACAFAAAHQAAAHgCAHQgCAHgEAFQgEAGgHADQgGAEgJAAQgJAAgGgEgAAkgLQgEADgCAEIgDAIIgBAIIABAJIADAJQACAEAEADQAFADAGAAQAHAAAEgDQAEgDACgEIAEgJIAAgJIAAgIQgBgEgDgEQgCgEgEgDQgEgDgHAAQgGAAgFADgAgQAxIgzhPIAABPIgNAAIAAhjIAQAAIAyBPIAAhPIAOAAIAABjg");
	this.shape.setTransform(0.3,0);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-7.9,-5.1,16.4,10.3);


(lib.Tween11 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("ABHAwQgHgDgDgEQgDgEgBgEIgBgIIAMAAIACAHQABADAEADQAEACAJAAQAEAAAEgBQAEgBACgDQACgCAAgEQAAgFgDgCQgDgCgIgCIgOgDQgIgCgFgEQgEgFAAgFQAAgIAEgFQADgGAHgCQAGgDAHAAQAKABAGACQAFADADAFIAEAHIAAAFIgMAAIgBgFQgBgDgEgCQgDgCgIAAIgFABQgEAAgDADQgCACgBAEQAAADACABIAEACIAIACIAMADQALADAFAFQAFAEAAAIQAAAHgEAGQgEAFgGADQgHADgIAAQgLAAgGgDgAgDAuQgIgFgEgIQgEgIAAgLQAAgLAEgHQAEgKAIgFQAFgFANgBQAKAAAHAGQAHAFAEAKQADAHAAANIgzAAQAAAMAFAGQADAGALAAQAGAAAEgCQAEgDACgDQADgDAAgDIAMAAIgCAFQgBAEgDAEQgCAEgFADIgEACIgGACIgKABQgKAAgFgFgAAhAGQAAgFgCgDQgCgFgEgDQgFgDgHgBQgGABgEADQgDADgDAFQgCADAAAFIAmAAIAAAAgAhOAxIAAgpIgmg6IAQAAIAdAxIAdgxIAQAAIgmA6IAAApg");
	this.shape.setTransform(-0.1,0);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-11.8,-5.1,23.5,10.3);


(lib.Tween2 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("ABHAwQgHgDgDgEQgDgEgBgEIgBgIIAMAAIACAHQABADAEADQAEACAJAAQAEAAAEgBQAEgBACgDQACgCAAgEQAAgFgDgCQgDgCgIgCIgOgDQgIgCgFgEQgEgFAAgFQAAgIAEgFQADgGAHgCQAGgDAHAAQAKABAGACQAFADADAFIAEAHIAAAFIgMAAIgBgFQgBgDgEgCQgDgCgIAAIgFABQgEAAgDADQgCACgBAEQAAADACABIAEACIAIACIAMADQALADAFAFQAFAEAAAIQAAAHgEAGQgEAFgGADQgHADgIAAQgLAAgGgDgAgDAuQgIgFgEgIQgEgIAAgLQAAgLAEgHQAEgKAIgFQAFgFANgBQAKAAAHAGQAHAFAEAKQADAHAAANIgzAAQAAAMAFAGQADAGALAAQAGAAAEgCQAEgDACgDQADgDAAgDIAMAAIgCAFQgBAEgDAEQgCAEgFADIgEACIgGACIgKABQgKAAgFgFgAAhAGQAAgFgCgDQgCgFgEgDQgFgDgHgBQgGABgEADQgDADgDAFQgCADAAAFIAmAAIAAAAgAhOAxIAAgpIgmg6IAQAAIAdAxIAdgxIAQAAIgmA6IAAApg");
	this.shape.setTransform(-0.1,0);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-11.8,-5.1,23.5,10.3);


(lib.Symbol1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#4577BF").ss(1,1,1).p("AEYIwQjoAAijilQikikAAjnQAAjnCkikQCjikDoAAQAABSgBHuQAAGxABBug");
	this.shape.setTransform(-27.7,0.5);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFFFFF").s().p("AhzGLQijikgBjnQABjnCjijQCiilDoAAIAAI/QAAGyAABuQjogBiiikg");
	this.shape_1.setTransform(-27.7,0.5);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().s("#4577BF").ss(1,1,1).p("Ak1AAQAAjCB1iTQAYgeAdgcQBzhtCGghQBNgSBMACQATA5AKCXQASCMAADZQAAAGAAAHQAADcgSCJQgLCCgLAyQhPAEhNgSQiIgghxhrQgDgDgCgCQgcgbgYgdQh1iUAAjDIAAgBg");
	this.shape_2.setTransform(-24.6,0.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FFFFFF").s().p("AByIgQiIgghxhrIgFgFQgcgbgYgdQh1iUAAjDIAAgBQAAjCB1iTQAYgeAdgcQBzhtCGghQBNgSBMACQATA5AKCXQASCMAADZIAAANQAADcgSCJQgLCCgLAyIgdABQhAAAg/gPg");
	this.shape_3.setTransform(-24.6,0.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f().s("#4577BF").ss(1,1,1).p("AExlnQAkCRABDhQAADhglCNQgVCFgXAvQhNAHhZgSQiJgdh2hsQgfgcgbghQh7iVAAjHQAAjGB6iVQAbggAggeQBzhqCJgcQBbgTBOAGQAYArAUCag");
	this.shape_4.setTransform(-21.5,0.5);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#FFFFFF").s().p("ABfIiQiKgdh1hsQgggcgaghQh7iVAAjHQABjGB6iVQAaggAggeQBzhqCIgcQBcgTBNAGQAZArAUCaQAkCRAADhQAADhgkCNQgVCFgYAvQgVACgVAAQg7AAhAgNg");
	this.shape_5.setTransform(-21.5,0.5);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f().s("#4577BF").ss(1,1,1).p("AmDAAQAAjMCAiXQAggkAggcQB+hrCKgWQBlgQBNAMQArAwAiCGQBACaAADdQgBDlg+CQQgCAEAAACQgkB8gmAsQhMANhfgPQgBAAAAAAQgHgBgGgBQiIgYh4hmQAAgBgBAAQgggcgdghQgBgBgBgBQgBgBgBgBQiBiYAAjMQAAAAAAAAg");
	this.shape_6.setTransform(-16.8,0.5);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#FFFFFF").s().p("ABOImIgBAAIgNgCQiIgYh4hmIgBgBQgggcgdghIgCgCIgBgCQiCiYAAjMIAAAAQAAjMCBiXQAfgkAggcQB+hrCKgWQBlgQBNAMQArAwAiCGQA/CaABDdQgBDlg+CQIgCAGQglB8glAsQglAGgoAAQgtAAgxgIg");
	this.shape_7.setTransform(-16.8,0.5);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f().s("#4577BF").ss(1,1,1).p("AFXl6QBcCeAADfQgBDlhaCWQgBACgBADQg0B3g2ApQhLAShkgKIgPgCQiPgRh/hmQgkgdgggiQgCgDgCgDQiKiaAAjTIAAAAQAAjSCJiaQAkgoAjgdQCChnCQgQQBvgNBPATQA4AoAxCAg");
	this.shape_8.setTransform(-12.1,0.5);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#FFFFFF").s().p("AA9IrIgQgCQiOgRh/hmQgjgdghgiIgEgGQiKiaAAjTIAAAAQAAjSCKiaQAjgoAkgdQCBhnCPgQQBwgNBOATQA5AoAxCAQBbCeABDfQgBDlhaCWIgDAFQgzB3g2ApQgwAMg7AAQghAAgjgEg");
	this.shape_9.setTransform(-12.1,0.5);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f().s("#4577BF").ss(1,1,1).p("AnwAAQAAjcCVifQAogpAngeQCDhgCcgJQB6gGBXAeQBMAoBBBmQCACkAADhQgBDmh9CbQgGAIgCACQhDBkhNAoQhRAahkgEQgHgBgHAAQihgJiEhjQgmgcgigjQgCgDgDgCQiWigAAjbIAAgBg");
	this.shape_10.setTransform(-5.9,0.5);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#FFFFFF").s().p("AAmItIgPgBQiggJiEhjQgmgcgigjIgFgFQiWigAAjbIAAgBQAAjcCVifQAogpAngeQCEhgCbgJQB5gGBYAeQBMAoBBBmQCACkAADhQgBDmh9CbIgIAKQhDBkhNAoQhHAWhVAAIgZAAg");
	this.shape_11.setTransform(-5.9,0.5);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f().s("#4577BF").ss(1,1,1).p("AGLmLQClCkAADnQAADnilCkQikCljnAAQjmAAililQikikAAjnQAAjnCkikQClikDmAAQDnAACkCkg");
	this.shape_12.setTransform(0.3,0.5);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#FFFFFF").s().p("AmLGLQijikgBjnQABjmCjilQCkijDnAAQDnAACkCjQClClAADmQAADnilCkQikCljngBQjnABikilg");
	this.shape_13.setTransform(0.3,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_3},{t:this.shape_2}]},1).to({state:[{t:this.shape_5},{t:this.shape_4}]},1).to({state:[{t:this.shape_7},{t:this.shape_6}]},1).to({state:[{t:this.shape_9},{t:this.shape_8}]},1).to({state:[{t:this.shape_11},{t:this.shape_10}]},1).to({state:[{t:this.shape_13},{t:this.shape_12}]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-56.7,-56.5,63.7,114);


(lib.N = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(19,162,0,0.008)").s().p("AhzGLQijikgBjnQABjnCjikQCjijDngBIAAI/QAAGyAABtQjnAAijikg");
	this.shape.setTransform(28,56);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,56,112);

})(lib = lib||{}, images = images||{}, createjs = createjs||{});
var lib, images, createjs;