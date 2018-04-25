/*
 *
 */
function SpriteAnim() {
	//
	var imageId;
	var _animObj;
	var imageGlobalInterval;
	var initialized = false;
	//
	this.drawImage = drawImage;
	this.startAnimation = startAnimation;
	this.resetAnimation = resetAnimation;
	this.pauseAnimation = pauseAnimation;
	this.resumeAnimation = resumeAnimation;
	//this.interval;
	/*
	 *
	 */
	function drawImage(aId,img_path,xOffSet,yOffSet)
	{
		var rxt = document.getElementById(aId).getContext('2d');
                console.log("rxt  : "+rxt);
		imageId = new Image();
                console.log("imageId  : "+imageId);
		imageId.onload = function()
		{
			rxt.drawImage(imageId,xOffSet,yOffSet);
		}
		imageId.src = img_path;
	}
	/*
	 *
	 */
	function startAnimation(aId,src,offsetx,offsety,hshift,vshift,steps,loop,xPos,yPos,interval,keyFrame,stepCallback)
	{
		initialized = true;
		//
		_animObj = new Object();
		_animObj.step = 0;
		_animObj.aId = aId;
		_animObj.src = imageId;
		_animObj.offsetx = offsetx;
		_animObj.offsety = offsety;
		_animObj.hshift = hshift;
		_animObj.vshift = vshift;
		_animObj.steps = steps;
		_animObj.loop = loop;
		_animObj.xPos = xPos;
		_animObj.yPos = yPos;
		_animObj.xStorePos = xPos;
		_animObj.yStorePos = yPos;
		if(stepCallback)
		{
			_animObj.stepCallback = stepCallback;
		}
		else
		{
			_animObj.stepCallback = null;
		}
		//
		if(interval)
		{
			_animObj.interval = interval;
		}
		else
		{
			_animObj.interval = 125;
		}
		// Code added here by Rupesh on 06-aug-2013
		if(keyFrame)
		{
			_animObj.keyFrame = keyFrame;
		}
		else
		{
			_animObj.keyFrame = "undefined";
		}
		// code end here
		
		
		//
		playAnimation();
	}
	/*
	 *
	 */
	function playAnimation()
	{
		if(initialized)
		{
			var _thisRef = this;
			clearInterval(imageGlobalInterval);
			imageGlobalInterval = setInterval(function()
			{
				var _cnv = document.getElementById(_animObj.aId);
				var _ctx = _cnv.getContext('2d');
				_cnv.width = _cnv.width;
				_ctx.drawImage(_animObj.src, _animObj.xPos - _animObj.offsetx, _animObj.yPos-_animObj.offsety);
				_animObj.step++;
				if(_animObj.stepCallback)
				{
					_animObj.stepCallback(_animObj.step);
				}
				if(_animObj.step >= Number(_animObj.steps))
				{
					if(_animObj.loop == "no")
					{
						clearInterval(imageGlobalInterval);
						//console.log(" In Sprite Ani  Id : " + _animObj.aId );
						EventBus.dispatch("SpriteAnimOver",this,_animObj.aId);
					}
					else
					{
						_animObj.step = 0;
						_animObj.xPos = _animObj.xStorePos;
						_animObj.yPos = _animObj.yStorePos;
					}
				}
				else
				{
					_animObj.xPos -= Number(_animObj.hshift);
					_animObj.yPos -= Number(_animObj.vshift);
					//
					// Code added here by Rupesh on 06-aug-2013
					if(_animObj.keyFrame != "undefined")
					{
						if(_animObj.step == Number(_animObj.keyFrame))
						{
							EventBus.dispatch("KeyframeReached",this,_animObj.aId);
						}
					}
					// End
				}
			},_animObj.interval);
		}
	}
	/*
	 *
	 */
	function resetAnimation(xOffSet,yOffSet)
	{
		if(initialized)
		{
			_animObj.step = 0;
			_animObj.xPos = 0;
			_animObj.yPos = 0;
			clearInterval(imageGlobalInterval);
			//	
			var _cnv = document.getElementById(_animObj.aId);
			var _ctx = _cnv.getContext('2d');
			_cnv.width = _cnv.width;
			if(!xOffSet && !yOffSet)
			{
				try
				{
					_ctx.drawImage(_animObj.src, xOffSet, yOffSet);
				}
				catch(e)
				{
				}
			}
			else
			{
				try
				{
					_ctx.drawImage(_animObj.src, -1*_animObj.offsetx, -1*_animObj.offsety);
				}
				catch(e)
				{
				}
			}
		}
	}
	
	function pauseAnimation()
	{
		clearInterval(imageGlobalInterval);
	}
	
	function resumeAnimation()
	{
		playAnimation();
	}
	
}