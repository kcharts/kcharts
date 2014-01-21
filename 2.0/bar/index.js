/**
 * overview bar
 * */
KISSY.add("gallery/kcharts/2.0/bar/index",function(S,KCharts,BaseChart,K,BaseUtil){

  //==================== utils ====================
  /**
   * TODO
   * 将 [{name:"第一组",data:[{xval:3,y:"A"},{xval:2,yval:"B"},...]}] for line/bar
   * 转化为
   *    [{name:"第一组",data:[{xval:3,x:2,y:1},{xval:2,x:3,y:3,yval:34},...]}] 最终格式
   *
   * 将series数据转为可用于画barchart的数据
   * @param series {Array}
   *   eg. [{x:"星期一",y:3},...]
   *   eg. [{x:2,y:4},...]
   * @param chartBBox {Object}
   *   - left
   *   - top
   *   - width
   *   - height
   * @param opt
   *   - basevalue {Number} 基线值 默认0
   *   - leftx 画布左下角x
   *   - lefty
   *   - width 画布宽度，除去padding
   *   - height 画布高度，除去padding
   * @return xys {Array}
   *   eg. [{x:x,y;y},...]
   * note:
   *   只要有数据，柱子就要有最小高度，避免看不见.
   * */
  function convertSeriesToPoints(series,chartBbox,opt){
    var values = K.map(series,function(serie){
                   return serie.value;
                 });

    var maxvalue = Math.max.apply(Math,values); // 柱子的最大值
    var minvalue = Math.min.apply(Math,values); // 柱子的最小值

    // 如果是柱状图，可能有
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
      var that = this;
      // series原始数据
      var series1 = this.get("series") || [];
      // 无数据不进行渲染
      if(series1.length === 0){
        return;
      }
      //==================== 数据转为画布点 ====================
      // [{name:"第一组",data:[{xval:3,y:"A"},{xval:2,yval:"B"},...]}]
      // series 标准数据格式
      var series2 = BaseUtil.formatSeriesData(series1);
      var barPaddingX = 5; // 柱形图的起始偏移量

      var chartBBox = this.setChartBBox();
      // 根据图表的左上角位置、图表宽度、高度（如果显示的设置了的话），转换所有的图标点为画布点

      // series转换到画布上的数据
      // TODO 设置默认rangeConfig值
      var xrangeConfig = {};
      var yrangeConfig = {};
      var seriesFilter = false; // serie过滤函数
      var convertOption = {}; // series数据转为paper数据的配置选项，{basevalue:val,barPaddingX:val2}

      var series3 = K.map(series2,function(serie){
                      var xy0 = serie.data;
                      var xy1 = BaseUtil.convertSeriesToPoints(xy0,chartBBox,xrangeConfig,yrangeConfig,seriesFilter,convertOption);
                      console.log(xy0,chartBBox,xrangeConfig,yrangeConfig,seriesFilter,convertOption);
                      console.log(JSON.stringify(xy1));
                      var ret = {};
                      S.mix(ret,serie,true,[],["data"],false);
                      ret.data = xy1;
                      return ret;
                    });

      var seriesLen = series3.length;
      //==================== 计算柱子宽度、间隔 ====================
      // {
      // barwidth:barwidth,
      // interval:interval,
      // totalWidth:barwidth+interval
      // }
      var barinfo = getBarInfo(chartBBox.width/seriesLen, // 如果有多组数据要进行划分
                               seriesLen,0.5,40,40);

      //==================== 渲染 ====================
      K.each(series3,function(serie,index){
        that._drawBars(serie.data,seriesLen,index,chartBBox,barinfo);
      });
    },
    _drawBars:function(points,groupLen,groupIndex,chartBBox,barinfo){
      var graph = this.get("graph");
      var paper = graph.get("paper");

      var barwidth = barinfo.barwidth;
      var that = this;
      var leftBottomY = chartBBox.top + chartBBox.height ;
      K.each(points,function(p){
        var leftBottomX = p.x - barwidth/2 + groupIndex*barinfo.totalWidth;
        var y = chartBBox.height - p.y + chartBBox.top; // 左下角的y
        var x = p.x - barwidth/2;
        paper.rect(x,y,barwidth,p.y,0);
      });
    }
  });

  return Bar;
},{
  requires:[
    "gallery/kcharts/2.0/graph/index",
    "gallery/kcharts/2.0/base/index",
    "gallery/kcharts/2.0/adapter/kissy",
    "gallery/kcharts/2.0/base/util"
  ]
});
