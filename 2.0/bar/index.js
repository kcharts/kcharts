/**
 * overview bar
 * */
KISSY.add("gallery/kcharts/2.0/bar/index",function(S,KCharts,BaseChart,K){

  //==================== utils ====================
  /** TODO 统一所有图表的数据格式
   * 将series数据统一为标准的格式
   * 1. [1,3,2,8,...] for line/bar/pie
   * 2. [{x:1,y:"Mon",color:"red"},{x:3,y:"Tue"},...] for line/bar/pie
   * 3. [{name:false,data:[{x:false,y:1},{x:false,y:3},...]}] for line/bar
   * 最终要转化为 [{name:"Group1",data:[ [xval,yval] , ... ]}]
   * */
  function formatSeriesData2(series){
  }

  /**
   * [1,3,2,8] --> [{value:1},...]
   * */
  function formatSeriesData(series){
    return K.map(series,function(item){
             if(!K.isObject(item)){
               return {
                 value:item
               }
             }else{
               return item;
             }
           });
  }

  /**
   * 将series数据转为可用于画barchart的数据
   * @param series {Array}
   *   eg. [{value:2},...]
   * @param opt
   *   - basevalue {Number} 基线值 默认0
   *   - leftx 画布左下角x
   *   - lefty
   *   - width 画布宽度，除去padding
   *   - height 画布高度，除去padding
   * @return xys {Array}
   *   eg. [{x:x,y;y},...]
   * note
   *   柱子有最小高度，避免看不见
   * */
  function convertSeriesToPoints(series,opt){
    var values = K.map(series,function(serie){
                   return serie.value;
                 });
    var maxvalue = Math.max.apply(Math,values); // 柱子的最大值
    var minvalue = Math.min.apply(Math,values); // 柱子的最小值

    var basevalue = opt.basevalue || 0; // 基线
    var len = series.length;

    var valuerange; // y值，也就是value跨度
    // 查看基线是否在最大值和最小值之间，来确定valuerange
    if(basevalue < minvalue){
      valuerange = maxvalue - basevalue;
    }else if(basevalue > maxvalue){
      valuerange = basevalue - minvalue;
    }else{
      valuerange = maxvalue - minvalue;
    }

    // 单位value对应的画布高度
    var UNITY = (opt.height - opt.padding.paddingTop - opt.padding.paddingBottom)/valuerange;

    var ys; // 所有的y值
    ys = K.map(series,function(serie){
           return (serie.value - basevalue) * UNITY;
         });
    var width2 = opt.width - opt.paddingx*2;
    var UNITX = width2/(len+1); // x轴有len+1份数

    var xys = [];
    for(var i=0;i<len;i++){
      xys.push({
        x:i*UNITX + opt.paddingx,
        y:ys[i]
      });
    }
    return xys;
  }

  /**
   * 获取柱子信息：柱子宽度、间隔
   * @param width 柱子占据空间宽度
   * @param num 柱子个数
   * @param maxWidth 柱子最大宽度
   * @param maxInterval 最大间隔
   * @param ratio 柱子所占的比率，剩下的就为间隔
   * */
  function getBarInfo(width,num,ratio,maxWidth,maxInterval){
    // 1个柱子数据其实会分成2份
    num+=1;
    var UNIT = width/num;
    var barwidth;
    var interval;
    barwidth = UNIT*ratio;
    maxWidth || (maxWidth = 50);
    if(barwidth > maxWidth){
      barwidth = maxWidth
    }
    interval = UNIT - barwidth;
    if(maxInterval){
      interval = maxInterval;
    }
    return {
      barwidth:barwidth,
      interval:interval,
      totalWidth:barwidth+interval
    }
  }
  //==================== end utils ====================

  var Bar = BaseChart.extend({
    initializer:function(){

    },
    render:function(){
      // series数据支持多种格式
      //
      //  [{color:"#f80",value:34},...]
      //
      // drawBar：位置、矩形
      // 计算出series中的最大值，计算各个series比例
      //

      var graph = this.get("graph");

      var seriesData = this.get("series") || [];
      // 无数据不进行渲染
      if(seriesData.length === 0){
        return;
      }

      var series = formatSeriesData(seriesData);

      var barPaddingX = 5;

      var gwidth = graph.get("containerWidth");
      var gheight = graph.get("containerHeight");

      // 得到柱状图左下角的点[(x,y),...]
      var points = convertSeriesToPoints(series,{
        width:gwidth,
        height:gheight,
        barPaddingX:barPaddingX, // 柱子x方向的偏移量
        padding:graph.getPadding(),
        basevalue:0 // TODO 可以配置
      });

      // 计算柱子宽度、间隔
      var barinfo = getBarInfo(gwidth,series.length,0.5,40,40,barPaddingX);
      //
      this._drawBars(points,barinfo);
    },
    _drawBars:function(points,barinfo){
      var graph = this.get("graph");
      var paper = graph.get("paper");
      var bbox = graph.getBBox();
      var pd = graph.getPadding();

      var x = bbox.left // 左下角x
        , y = bbox.height + pd.paddingTop;// 左下角y

      var barwidth = barinfo.barwidth;
      var that = this;
      K.each(points,function(p){
        var barheight = p.y;
        that._drawBar(paper,x,y,barwidth,barheight,{
          radius:0
        });
        // x递增
        x+=barinfo.totalWidth;
        // y不变
      });
    },
    /**
     * 画矩形
     * @param opt {Object}
     *   - radius {Number} 默认为0
     *   -
     * @param width bar的宽度
     * @param height bar的高度
     * */
    _drawBar:function(paper,leftBottomX,leftBottomY,width,height,opt){
      var leftTopX = leftBottomX
        , leftTopY = leftBottomY - height
      return paper.rect(leftTopX,leftTopY,width,height,opt.radius || 0);
    }
  });

  return Bar;
},{
  requires:[
    "gallery/kcharts/2.0/graph/index",
    "gallery/kcharts/2.0/base/index",
    "gallery/kcharts/2.0/adapter/kissy"
  ]
});
