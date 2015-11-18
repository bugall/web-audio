window.AudioContext= window.AudioContext||window.webkitAudioContext||window.mozAudioContext;
RAF=(function(){
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {window.setTimeout(callback, 1000/60); };
})();

function audioParse(){
    this._musicBuffer=null;
    this._AC = new AudioContext();
    this._gainNode=this._AC.createGain();
    this._absn=null;
    this._analyser=null;

    this._musicBuffer_review=null;
    this._AC_review = new AudioContext();
    this._gainNode_review=this._AC_review.createGain();
    this._absn_review=null;
    this._analyser_review=null;
    this._review_buffer;

    this._isStartReview=false;
    this._isStart=false;
    this.timer;
    this.reviewAudio;
}

audioParse.prototype.loadSound=function(url,callback){
    var xhr = new XMLHttpRequest(),
        self=this;
    xhr.open('get' , url);
    xhr.responseType = "arraybuffer";
    xhr.onreadystatechange=function(){
        if (xhr.readyState == 4) {//readyState表示文档加载进度,4表示完毕
            console.log(xhr.reponseText);//responseText属性用来取得返回的文本
        }
    }
    xhr.onload = function(){
        self._musicBuffer = xhr.response;
        self._musicBuffer_review=xhr.response;
        console.log('下载完成');
        callback()
    };
    xhr.send();
}
audioParse.prototype.audioDecodeBuffer=function(arraybuffer,callback){
    var self=this;
    this._AC.decodeAudioData(arraybuffer,function(buffer){
        console.log('文件解压成功');
        self.playMusic(buffer,'',callback);
    },function(e){
        console.log('文件解码失败');
    })
}
audioParse.prototype.playMusic=function(buffer,second,callback){
    var self=this;
    this._review_buffer=buffer;
    this._absn=this._AC.createBufferSource();
    this._analyser=this._AC.createAnalyser();
    this._absn.connect(this._analyser);
    this._absn.connect(this._gainNode);
    this._gainNode.connect(this._AC.destination);
    this._absn.buffer=buffer;

    this._absn.loop=false;
    this._isStart=true;
    this._gainNode.gain.value=0;
    this._absn.start(0,second||0);
    callback();
}
audioParse.prototype.catchData=function(){
    var array = new Uint8Array(this._analyser.frequencyBinCount);
    var self=this;
    this._analyser.getByteFrequencyData(array)
    var tmp=0;
    for(var i=0;i<35;i++){
        var power=array[~~(i*array.length/35)];
        if(power){
            tmp+=power;
        }
    }
    return {data:tmp,time:this._AC.currentTime.toFixed(1)};
}
audioParse.prototype.reviewCatchData=function(){
    var array = new Uint8Array(this._analyser_review.frequencyBinCount);
    var self=this;
    this._analyser_review.getByteFrequencyData(array)
    var tmp=0;
    for(var i=0;i<35;i++){
        var power=array[~~(i*array.length/35)];
        if(power){
            tmp+=power;
        }
    }
    return {data:tmp,time:this._AC_review.currentTime.toFixed(1)};
}
//review audio play
audioParse.prototype.reviewAudioPlay=function(volume,start,end){
    var self=this;
    if(!this._isStartReview){
        this._absn_review=this._AC_review.createBufferSource();
        this._analyser_review=this._AC_review.createAnalyser();
        this._absn_review.connect(this._analyser_review);
        this._absn_review.connect(this._gainNode_review);
        this._gainNode_review.connect(this._AC_review.destination);
        this._absn_review.buffer=this._review_buffer;
        console.log(123123);
        this._isStartReview=true;
        this._gainNode_review.gain.value=volume || 1;
        this._absn_review.loop = false;
        this._absn_review.start(0,start,(end-start).toFixed(1));
        console.log(start,end);
        setTimeout(self._isStartReview=false,(end-start).toFixed(1)*1000);
    }
}

