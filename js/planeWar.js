if(!window.DDBlockly)
	window.DDBlockly={};

DDBlockly.blocksEnabled_ = true;
/**
 * ACE editor fires change events even on programatically caused changes.
 * This property is used to signal times when a programatic change is made.
 */
DDBlockly.ignoreEditorChanges_ = true;

DDBlockly.editor = null;

DDBlockly.workspace = null;

DDBlockly.MAP= {};

DDBlockly.KEY = "ddblockly_tank";
DDBlockly.state={
	diff:'',
	level_num:1
};
DDBlockly.tank={
		pos:{x:0,y:0},
		angel:0
};

DDBlockly.blocks = [
	['tank_fire'],
	['tank_turn', 'tank_fire'],
	['tank_moveForward', 'tank_turn', 'tank_fire'],
	['tank_moveForward', 'tank_turn', 'tank_fire'],
	['tank_moveForward', 'tank_turn', 'tank_fire', 'tank_stop'],
	['tank_moveForward', 'tank_turn', 'tank_fire', 'tank_stop'],
	['tank_moveForward', 'tank_turn', 'tank_fire', 'tank_stop', 'controls_repeat'],
	['tank_moveForward', 'tank_turn', 'tank_fire', 'tank_stop', 'controls_repeat'],
	['tank_moveForward', 'tank_turn', 'tank_fire', 'tank_stop', 'controls_repeat'],
	['tank_moveForward', 'tank_turn', 'tank_fire', 'tank_stop', 'controls_repeat']
];

/**
 * PIDs of animation tasks currently executing.
 */
DDBlockly.pidList = [];

DDBlockly.init = function(param){
	console.log("DDBlockly.init");

    var blocklyDiv = document.getElementById('workspce_block');

    $("#playBtn").click(DDBlockly.runButtonClick);
    $("#resetBtn").click(DDBlockly.retryBtnClick);

    //inject Blockly
    var toolbox = document.getElementById('toolbox');
    //var toolbox = DDBlockly.getToolboxXML('intro',3);

		Game.initToolbox(DDBlockly);
		//Game.initWorkspace();

    DDBlockly.workspace = Blockly.inject(blocklyDiv,
    {
		grid: {
		spacing: 25,
		length: 3,
		colour: '#ccc',
		snap: true
		},
		media: 'media/',
		toolbox: toolbox,
		trashcan: true,
		zoom: {controls: true, wheel: false}
		 });
    var defaultXml =
        '<xml>' +
        '  <block type="tank_fire" x="70" y="70"></block>' +
        '</xml>';
    DDBlockly.setCode(defaultXml, false);

};


DDBlockly.getToolboxXML = function(diff,num) {
	/*
	 * 第一级积木： 只有前进和开炮
	 * 第二级积木：坦克，前进，转弯，开炮，停止
	 * 第三级别：增加循环次数空间
	 * 第四级别：数学、变量、逻辑
	 * 第五级别：函数
	 */
	var boxLevel = 2;
	if(diff=='intro'){
		if(num == 0){
			boxLevel = 1;
		}
		else if(num >4){
			boxLevel = 3;
		}
	}
	if(diff=='beginner'){
		if(num < 3){
			boxLevel = 4;
		}
		else{
			boxLevel = 5;
		}
	}

		var toolbox = '<xml>';
		toolbox += 		'<block type="tank_fire"></block>';
		toolbox += 		'<block type="tank_moveForward"></block>';
	if(boxLevel >= 2){
		toolbox +=		'<block type="tank_turn"> <field name="DIR">turnLeft</field> </block>'+
						'<block type="tank_turn"> <field name="DIR">turnRight</field> </block>';
		toolbox +=		'<block type="tank_stop"></block> ';
	}//

		//toolbox += '<sep></sep>';

	if(boxLevel >= 3){
		toolbox += '<category name="循环">'+
						'<block type="controls_repeat_ext">'+
							'<value name="TIMES"> <shadow type="math_number"> '+
								'<field name="NUM">10</field> </shadow> </value>'+
						'</block> ';
		toolbox += '</category>';
	}
	if(boxLevel >= 4){
		toolbox += '<category name="逻辑">';
		toolbox += 		'<block type="controls_if"></block> ';
		toolbox += 		'<block type="logic_compare"></block> ';
		toolbox += 		'<block type="logic_operation"></block> ';
		toolbox += 		'<block type="logic_boolean"></block> ';
		toolbox += '</category>';

		toolbox += '<category name="数学">';
		toolbox += 		'<block type="math_number"></block> ';
		toolbox += 		'<block type="math_arithmetic">'+
							'<value name="A"> <shadow type="math_number"> <field name="NUM">1</field> </shadow> </value>'+
							'<value name="B"> <shadow type="math_number"> <field name="NUM">1</field> </shadow> </value> </block> ';
		toolbox += 		'<block type="math_single"> '+
							'<value name="NUM"> <shadow type="math_number"> <field name="NUM">9</field>  </shadow> </value> </block> ';
		toolbox += '</category>';

		toolbox += '<category name="变量" custom="VARIABLE">';
		toolbox += 		'<block type="variables_get"></block>';
		toolbox += 		'<block type="variables_set"></block>';
		toolbox += '</category>';
	}

	if(boxLevel >= 5){
		toolbox += '<category name="文本"> ';
		toolbox += 		'<block type="text"></block> ';
		toolbox += 		'<block type="text_join"></block>';
		toolbox += 		'<block type="text_print"></block> ';
		toolbox += 		'<block type="text_prompt_ext"></block>';
		toolbox += '</category>';

		toolbox += '<category name="文本"> ';
		toolbox += 		'<block type="text"></block> ';
		toolbox += 		'<block type="text_join"></block>';
		toolbox += 		'<block type="text_print"></block> ';
		toolbox += 		'<block type="text_prompt_ext"></block>';
		toolbox += '</category>';

		toolbox += '<category name="函数过程" custom="PROCEDURE">';
		toolbox += '</category>';
	}


	toolbox += '</xml>';
	return toolbox;

}
/**
 * Set the given code (XML or JS) to the editor (Blockly or ACE).
 * @param {string} code XML or JS code.
 */
DDBlockly.setCode = function(code,isText) {
	console.log("DDBlockly.setCode:",code);
	if(!code){
		return;
	}
  if (DDBlockly.editor && isText) {
    // Text editor.
	  DDBlockly.editor['setValue'](code, -1);
  } else {
    // Blockly editor.
    var xml = Blockly.Xml.textToDom(code);
    // Clear the workspace to avoid merge.
    DDBlockly.workspace.clear();
    Blockly.Xml.domToWorkspace(DDBlockly.workspace, xml);
  }
};

DDBlockly.getCode = function(isText) {
  if (DDBlockly.editor && isText) {
    // Text editor.
    var text = DDBlockly.editor['getValue']();
    console.log("getCode from editor text:" + text);
  } else {
    // Blockly editor.
    var xml = Blockly.Xml.workspaceToDom(DDBlockly.workspace);
    console.log("getCode workspaceToDom xml:", xml);
    var text = Blockly.Xml.domToText(xml);
    console.log("getCode domToText:", text);
  }
  return text;
};

DDBlockly.loadFromLocalStorage = function(diff, level) {
  var xml;
  try {
    xml = window.localStorage[DDBlockly.KEY + diff + level];
  } catch(e) {
    // Firefox sometimes throws a SecurityError when accessing localStorage.
    // Restarting Firefox fixes this, so it looks like a bug.
  }
  return xml;
};

DDBlockly.saveToLocalStorage = function(isText) {
  // MSIE 11 does not support localStorage on file:// URLs.
  if (typeof Blockly == undefined || !window.localStorage) {
    return;
  }
  var name = DDBlockly.KEY + DDBlockly.state.diff + DDBlockly.state.level_num;
  var content = DDBlockly.getCode(isText);
  window.localStorage[name] = content;
  console.log("saveToLocalStorage,key:" + name + ";content:"+content);
};

/**
 * Click the run button.  Start the program.
 * @param {!Event} e Mouse or touch event.
 */
DDBlockly.runButtonClick = function(e) {
  // Prevent double-clicks or double-taps.
  if (DDBlockly.eventSpam(e)) {
    return;
  }
  var runButton = document.getElementById('playBtn');
  var resetButton = document.getElementById('resetBtn');
  // Ensure that Reset button is at least as wide as Run button.
  if (!resetButton.style.minWidth) {
    resetButton.style.minWidth = runButton.offsetWidth + 'px';
  }
  runButton.style.display = 'none';
  resetButton.style.display = 'inline';
  DDBlockly.workspace.traceOn(true);

  DDBlockly.saveToLocalStorage(false);

  DDBlockly.reset();
  DDBlockly.execute();
};

DDBlockly.reset = function(first) {
	  // Kill all tasks.
	  for (var x = 0; x < DDBlockly.pidList.length; x++) {
	    window.clearTimeout(DDBlockly.pidList[x]);
	  }
	  DDBlockly.pidList = [];
};

DDBlockly.highlight = function(id) {
  if (id) {
    var m = id.match(/^block_id_([^']+)$/);
    if (m) {
      id = m[1];
    }
  }
  DDBlockly.workspace.highlightBlock(id);
};

/**
 * Outcomes of running the user program.
 */
DDBlockly.ResultType = {
  UNSET: 0,
  SUCCESS: 1,
  FAILURE: -1,
  TIMEOUT: 2,
  ERROR: -2
};
/**
 * Inject the Bird API into a JavaScript interpreter.
 * @param {!Interpreter} interpreter The JS interpreter.
 * @param {!Object} scope Global scope.
 */
DDBlockly.initInterpreter = function(interpreter, scope) {
  // API
  var wrapper;
  //move
  wrapper = function(angle, id) {
	  DDBlockly.cmdMove(angel,id.toString());
  };
  interpreter.setProperty(scope, 'move',
	      interpreter.createNativeFunction(wrapper));
  //moveForward
  wrapper = function(id) {
	  DDBlockly.cmdMoveForward(id.toString());
  };
  interpreter.setProperty(scope, 'moveForward',
      interpreter.createNativeFunction(wrapper));
  //
  wrapper = function(id) {
	  DDBlockly.cmdTurn(0, id.toString());
	  };
  interpreter.setProperty(scope, 'turnLeft',
      interpreter.createNativeFunction(wrapper));
  wrapper = function(id) {
	  DDBlockly.cmdTurn(1, id.toString());
  };
  interpreter.setProperty(scope, 'turnRight',
      interpreter.createNativeFunction(wrapper));

  //turn2
  wrapper = function(angel,id) {
	  DDBlockly.cmdTurn2(angle.valueOf(), id.toString());
  };
  interpreter.setProperty(scope, 'turn2',
      interpreter.createNativeFunction(wrapper));
  //fire
  wrapper = function(id) {
	  DDBlockly.cmdFire(id.toString());
  };
  interpreter.setProperty(scope, 'fire',
      interpreter.createNativeFunction(wrapper));
  //stop
  wrapper = function(id) {
	  DDBlockly.cmdStop( id.toString());
  };
  interpreter.setProperty(scope, 'stop',
      interpreter.createNativeFunction(wrapper));
  //
  wrapper = function() {
    return interpreter.createPrimitive(DDBlockly.tank.pos.x);
  };
  interpreter.setProperty(scope, 'getX',
      interpreter.createNativeFunction(wrapper));
  //
  wrapper = function() {
    return interpreter.createPrimitive(DDBlockly.tank.pos.y);
  };
  interpreter.setProperty(scope, 'getY',
      interpreter.createNativeFunction(wrapper));
};

/**
 * Execute the user's code.  Heaven help us...
 */
DDBlockly.execute = function() {
	console.log("execute begin");
  if (!('Interpreter' in window)) {
    // Interpreter lazy loads and hasn't arrived yet.  Try again later.
	  console.log("execute can not find Interpreter");
    setTimeout(DDBlockly.execute, 250);
    return;
  }

  DDBlockly.log = [];
  var code = Blockly.JavaScript.workspaceToCode(DDBlockly.workspace);

  var result = DDBlockly.ResultType.UNSET;
  var interpreter = new Interpreter(code, DDBlockly.initInterpreter);

  // Try running the user's code.  There are four possible outcomes:
  // 1. If bird reaches the finish [SUCCESS], true is thrown.
  // 2. If the program is terminated due to running too long [TIMEOUT],
  //    false is thrown.
  // 3. If another error occurs [ERROR], that error is thrown.
  // 4. If the program ended normally but without finishing [FAILURE],
  //    no error or exception is thrown.
  try {
    var ticks = 100000;  // 100k ticks runs Bird for about 3 minutes.
    while (interpreter.step()) {
      if (ticks-- == 0) {
        throw Infinity;
      }
    }
    result = DDBlockly.ResultType.FAILURE;
  } catch (e) {
    // A boolean is thrown for normal termination.
    // Abnormal termination is a user error.
    if (e === Infinity) {
      result = DDBlockly.ResultType.TIMEOUT;
    } else if (e === true) {
      result = DDBlockly.ResultType.SUCCESS;
    } else if (e === false) {
      result = DDBlockly.ResultType.ERROR;
    } else {
      // Syntax error, can't happen.
      result = DDBlockly.ResultType.ERROR;
      window.alert(e);
    }
  }

  // Fast animation if execution is successful.  Slow otherwise.
  //Bird.stepSpeed = (result == Bird.ResultType.SUCCESS) ? 10 : 15;

  // Bird.log now contains a transcript of all the user's actions.
  // Reset the bird and animate the transcript.
  //Bird.reset(false);
  //Bird.pidList.push(setTimeout(Bird.animate, 1));

  console.log("user code excute ok,result: " + result +";log:",DDBlockly.log);

  DDBlockly.highlight(null);

  DDBlockly.game.runProgram(DDBlockly.log);

//  DDBlockly.highlight(null);
//  var runButton = document.getElementById('runButton');
//  runButton.style.display = 'inline';
//  document.getElementById('resetButton').style.display = 'none';
};

/**
 * Determine if this event is unwanted.
 * @param {!Event} e Mouse or touch event.
 * @return {boolean} True if spam.
 */
DDBlockly.eventSpam = function(e) {
  // Touch screens can generate 'touchend' followed shortly thereafter by
  // 'click'.  For now, just look for this very specific combination.
  // Some devices have both mice and touch, but assume the two won't occur
  // within two seconds of each other.
  var touchMouseTime = 2000;
  if (e.type == 'click' &&
		  DDBlockly.eventSpam.previousType_ == 'touchend' &&
		  DDBlockly.eventSpam.previousDate_ + touchMouseTime > Date.now()) {
    e.preventDefault();
    e.stopPropagation();
    return true;
  }
  // Users double-click or double-tap accidentally.
  var doubleClickTime = 400;
  if (DDBlockly.eventSpam.previousType_ == e.type &&
		  DDBlockly.eventSpam.previousDate_ + doubleClickTime > Date.now()) {
    e.preventDefault();
    e.stopPropagation();
    return true;
  }
  DDBlockly.eventSpam.previousType_ = e.type;
  DDBlockly.eventSpam.previousDate_ = Date.now();
  return false;
};

DDBlockly.eventSpam.previousType_ = null;
DDBlockly.eventSpam.previousDate_ = 0;

DDBlockly.cmdMoveForward = function(id) {
  DDBlockly.log.push(['move', id]);
};

DDBlockly.cmdTurn = function(direction, id) {
	  if (direction) {
	    // Right turn (clockwise).
	    DDBlockly.log.push(['right', id]);
	  } else {
	    // Left turn (counterclockwise).

		  DDBlockly.log.push(['left', id]);
	  }

	};

DDBlockly.cmdMove = function(angel,id) {
  var angleRadians = goog.math.toRadians(angle);
  DDBlockly.tank.pos.x += Math.cos(angleRadians);
  DDBlockly.tank.pos.y += Math.sin(angleRadians);
  DDBlockly.tank.angle = angle;
  DDBlockly.log.push(['move2', DDBlockly.tank.pos.x, DDBlockly.tank.pos.y, DDBlockly.tank.angle, id]);
};
DDBlockly.cmdTurn2 = function(angle, id) {
  var angleRadians = goog.math.toRadians(angle);
  DDBlockly.tank.angle = angle;
  DDBlockly.log.push(['turn', DDBlockly.tank.angle, id]);
};

DDBlockly.cmdFire = function(id) {
  DDBlockly.log.push(['fire', id]);
};

DDBlockly.cmdStop = function(id) {
  DDBlockly.log.push(['wait', id]);
};

DDBlockly.displayOverlay = function(pageId) {

    var contentNode = $('#overlay-contents');
    //display
    var content = $('#'+pageId).html();
    contentNode.html(content);
    //console.log("displayOverlay:"+content)
    $('#overlay').show();
    contentNode.show();
};

DDBlockly.hideOverlay = function(){
	$('#overlay').hide();
    $('#overlay-contents').hide();
}

//保存用户名按钮
//DDBlockly.saveNameBtnClick = function(){
//	$('#overlay').hide();
//	$('#overlay-contents').hide();
//}

DDBlockly.retryBtnClick = function(e){
	console.log("retryBtnClick");
	// Prevent double-clicks or double-taps.
	  if (DDBlockly.eventSpam(e)) {
	    return;
	  }
	  var runButton = document.getElementById('playBtn');
	  runButton.style.display = 'inline';
	  document.getElementById('resetBtn').style.display = 'none';
	  DDBlockly.workspace.traceOn(false);
	  DDBlockly.reset();
	  //game reset
	DDBlockly.game.resetLevel();
}

/**
 * Convert the user's code to raw JavaScript.
 * @param {string} code Generated code.
 * @return {string} The code without serial numbers and timeout checks.
 */
DDBlockly.stripCode = function(code) {
  // Strip out serial numbers.
  return goog.string.trimRight(code.replace(/(,\s*)?'block_id_[^']+'\)/g, ')'));
};