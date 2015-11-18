(function(){
    var parseData=[],
        tmpData=[],
        oldTmpData={
        time:0,
        index:0
    },
    ctx = document.getElementById("chart-canvas").getContext("2d"),
        tmp=[],
        index=[];

    for(var i=0;i<50;i++){
        tmp.push(Math.random(1000));
        index.push(i);
    }
    var canvasData={
        labels:index,
        datasets : [
            {
                fillColor : "rgba(151,187,205,0.5)",
                strokeColor : "rgba(151,187,205,1)",
                pointColor : "rgba(151,187,205,1)",
                pointStrokeColor : "#fff",
                data:tmp
            }
        ]
    }
    var musicParseShow = new Chart(ctx).Line(canvasData,{
        animation:false,
        scaleSteps:0,
        scaleShowLabels: false,
        scaleShowGridLines: false,
        showScale:true,
        tooltipEvents:["", "touchstart", "touchmove"],
        tooltipTitleFontSize: 8,
        tooltipFontSize:8,
        tooltipXPadding:20,
        scaleStartValue: 1,
        scaleStartValue: 0,
        pointDotRadius : 0,
        scaleStepWidth: 40,
        scaleSteps: 40,
        scaleOverride: true,
        multiTooltipTemplate:'<%=value%>s'
    }),
    canvasObj = $('#chart-canvas');
    $('#upload-file').on('click',function(){
        if($('#upload-file').hasClass('disabled')) return;
        var obj = $('#upload-file-hidden');
        obj.click();
        obj.change(function(){
            button.hidden('正在上传');
            $('form').submit();
        })
    })
    playAudio();
    var audioObj;
    //判断是否结束
    var zeroTimes=0;
    function playAudio(){
        var positionIndex=50;
        audioObj = new audioParse();

        audioObj.loadSound('upload/1.mp3',function(){
            audioObj.audioDecodeBuffer(audioObj._musicBuffer,function(){
                audioObj.timer=setInterval(function(){
                    var result=audioObj.catchData()
                    positionIndex++;
                    result['index']=positionIndex++;
                    tmpData.push(result);
                    if(result.data==0){
                        zeroTimes++;
                    }
                    if(zeroTimes>200){
                        finish();
                    }
                    if(tmpData.length>2){
                        if(tmpData[tmpData.length-2].data!=result.data){
                            zeroTimes=0;
                        }
                    }
                    //groupData(result.data,positionIndex);
                },100/6);
            });
        })
    }
    function groupData(data,index){
        musicParseShow.removeData();
        musicParseShow.addData([data],index);
    }
    function finish(){
        clearInterval(checkTimer);
        clearInterval(audioObj.timer);
    }
    var analysisObj = new analysis(),
        finallData=[],
        finallShowOldIndex=1;
    var checkTimer=setInterval(function(){
        var tmp = tmpData;
        var buff=analysisObj.search(analysisObj._oldIndex,tmp);
        for(var i in buff){
            finallData.push(buff[i]);
        }
        for(var i=finallShowOldIndex;i<finallData.length;i++){
            console.log(finallData[i].time);
            var left=tmpData[finallData[i-1].index],
                right=tmpData[finallData[i].index]
            if((right.time-left.time).toFixed(1)>1.0){
                var  tmp={
                    bg_time:left.time,
                    bg_index:left.index,
                    ed_time:right.time,
                    ed_index:right.index,
                    timeLen:(right.time-left.time).toFixed(1),
                }
                $('.segment-list ul').append(_.template($('#test-temp').html())({data:tmp}));
            }
        }
        finallShowOldIndex=finallData.length;
    },10*1000);

    function analysis(){
        this._isSplicePointIndex=[];
        this._oldIndex=0;
    }
    //开始查找斜率最低的点
    analysis.prototype.search=function(leftIndex,tmpData){
        var data=[],
            tmp=[],
            min=99999,
            isSplice=false;

        for(var i = leftIndex;i<tmpData.length-1;i++){
            isSplice=false;
            //判断总能量是否位0
            if(tmpData[i].data==0){
                for(var j=i-20;j<i+20;j++){
                    if(this._isSplicePointIndex[j]){
                        isSplice=true;
                        break;
                    }
                }
                if(!isSplice){
                    this._isSplicePointIndex[i]=1;
                    tmp.push({
                        index:i,
                        time:tmpData[i].time
                    })
                }
            }
        }
        isSplice=false;
        var positionIndex=0;
        for(var i=leftIndex;i<tmpData.length;i++){
            isSplice=false;
            //找出最低点
            if(tmpData[i].data<min){
                for(var j=i-20;j<i+20;j++){
                    if(this._isSplicePointIndex[j]){
                        isSplice=true;
                        break;
                    }
                }
                if(!isSplice){
                    min=tmpData[i].data;
                    positionIndex=i;
                }
            }
        }
        //如果找到满足条件的
        if(positionIndex!=0){
            this._isSplicePointIndex[positionIndex]=1;
            tmp.push({
                index:positionIndex,
                time:tmpData[positionIndex].time
            });
        }
        for(var i=0;i<tmp.length-1;i++){
            for(var j =i+1;j<tmp.length;j++){
                if(tmp[j].time<tmp[i].time){
                    var buff = tmp[j];
                    tmp[j]=tmp[i];
                    tmp[i]=buff;
                }
            }
        }
        this._oldIndex=tmpData.length-1;
        return tmp;
    }

    //交互设计
    document.onkeydown=function(event){
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if(e && e.keyCode==13){ 
            var obj = tmpData[tmpData.length-1],
                tmp={
                bg_time:oldTmpData.time,
                bg_index:oldTmpData.index,
                ed_time:obj.time,
                ed_index:tmpData.length-1,
                timeLen:(obj.time-oldTmpData.time).toFixed(1),
            }
            $('.segment-list ul').append(_.template($('#test-temp').html())({data:tmp}));
            oldTmpData={
                time:obj.time,
                index:tmpData.length-1
            }
        }
    }

    var button={
        show:function(msg){
            $('#upload-file').text(msg);
            $('#upload-file').removeClass('disabled');
        },
        hidden:function(msg){
            $('#upload-file').text(msg);
            $('#upload-file').addClass('disabled');
        }
    }
    var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
        mode: "application/xml",
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true
    })
    /**
     *  * underscore template settings
     *   */
    _.templateSettings = {
        evaluate    : /<#([\s\S]+?)#>/g,
        interpolate : /<#=([\s\S]+?)#>/g,
        escape      : /<#-([\s\S]+?)#>/g
    };
    var lastClickObj,
        currentClickObj;
    $(document).on('click','.audio-review',function(){
        currentClickObj=$(this);
        var obj = $(this).parent().parent(),
            start=obj.attr('data-bg_time')-0.5,
            end=obj.attr('data-ed_time')-0.5;
        audioObj.reviewAudioPlay(1,start,end);

        var reviewTimer=setInterval(function(){
            var data=audioObj.reviewCatchData();
            console.log(data);
            groupData(data.data,data.time);
        },100/6);
        var time = (end-start).toFixed(1)*1000;
        setTimeout(function(){
            clearInterval(reviewTimer);
        },((end-start).toFixed(1))*1000);
        //选中状态
        if(lastClickObj){
            itemStatut(lastClickObj,'#888');
        }
        itemStatut($(this),'#269abc');
        lastClickObj=$(this);
    })
    function itemStatut(obj,color){
        obj.find('.send').css({'background-color':color});
        obj.find('.arrow').css({'border-color':'#f3f3f3 #f3f3f3 #f3f3f3 '+color});
    }
    
    function fixed(len,data){
        return data.toFixed(1);
    }
    $(document).on('click','.left-left',function(){
        var obj = currentClickObj.parent().parent(),
            time=obj.attr('data-bg_time');
        obj.attr('data-bg_time',fixed(1,time-0.5));
        var old = obj.find('.segment-time').text();
        obj.find('.segment-time').text(fixed(1,old-0+0.5));
    })
    $(document).on('click','.left-right',function(){
        var obj = currentClickObj.parent().parent(),
            time=obj.attr('data-bg_time');
        obj.attr('data-bg_time',fixed(1,time-0+0.5));
        var old = obj.find('.segment-time').text();
        obj.find('.segment-time').text(fixed(1,old-0.5));
    })
    $(document).on('click','.right-left',function(){
        var obj = currentClickObj.parent().parent(),
            time=obj.attr('data-ed_time');
        obj.attr('data-ed_time',fixed(1,time-0.5));
        var old = obj.find('.segment-time').text();
        obj.find('.segment-time').text(fixed(1,old-0.5));
    })
    $(document).on('click','.right-right',function(){
        var obj = currentClickObj.parent().parent(),
            time=obj.attr('data-ed_time');
        obj.attr('data-ed_time',fixed(1,time-0+0.5));
        var old = obj.find('.segment-time').text();
        obj.find('.segment-time').text(fixed(1,old-0+0.5));
    })
})()

