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

      // note:注意产度的计算
      var seriesLen = series2[0].data.length;

      var maxWidth = 40
        , maxInterval = 40 // 单个柱形之间的最大间隔
        , maxGroupInterval = 80 // 柱形图组之间的最大间隔
        , ratio = 0.3 ;

      var interval; // bar之间的间隔
      var barwidth; // bar的宽度

      // 计算合适barPadding
      var barPadding = 10;
      var w1 = barPadding*2 + maxInterval*(seriesLen-1) + maxWidth*seriesLen; // 最大宽度
      if(w1 < chartBBox.width){
        barPadding = (chartBBox.width - (maxInterval*(seriesLen-1) + maxWidth*(seriesLen)))/2;
        interval = maxInterval;
        barwidth = maxWidth;
      }else{
        // 计算过程
        // x/(x+y) = r
        // x = r(x+y) = rx + ry
        // x - rx = ry
        // ==>
        // y = (1 - r)x/r
        //
        // nx+(n-1)y = w
        // nx+(n-1)(1-r)x/r = w
        // nx+(n-1-nr+r)x/r = w
        // x(n+(n-1-nr+r)/r) = w
        // x = w/(n+(n-1-nr+r)/r)
        //
        // y = (1 - r)x/r
        //
        var totalWidth = chartBBox.width - barPadding*2;

        barwidth = totalWidth/(seriesLen+(seriesLen-1-seriesLen*ratio+ratio)/ratio);
        interval = (1 - ratio)*barwidth/ratio;
      }

      // 柱信息
      var barinfo = {
          barwidth:barwidth,
          interval:interval,
          totalwidth:barwidth+interval
      };

      // barPadding = 100;
      // console.log(barPadding);

      // series转换到画布上的数据
      // TODO 设置默认rangeConfig值
      var xrangeConfig = {};
      var yrangeConfig = {};
      var seriesFilter = false; // serie过滤函数
      var convertOption = {}; // series数据转为paper数据的配置选项，{basevalue:val,barPaddingX:val2}
      convertOption.basevalue = 0;
      convertOption.barPadding = barPadding;

      var series3 = K.map(series2,function(serie){
                      var xy0 = serie.data;
                      var xy1 = BaseUtil.convertSeriesToPoints(xy0,chartBBox,xrangeConfig,yrangeConfig,seriesFilter,convertOption,barinfo);
                      var ret = {};
                      // 复制一份数据
                      S.mix(ret,serie,true,[],["data"],false);
                      ret.data = xy1;
                      return ret;
                    });

      //==================== 渲染 ====================
      K.each(series3,function(serie,index){
        that._drawBars(serie.data,seriesLen,index,chartBBox,barinfo,convertOption);
      });
    },
    /**
     * @param barOption
     *   - barPadding 填充
     * */
    _drawBars:function(points,groupLen,groupIndex,chartBBox,barinfo,barOption){
      var graph = this.get("graph");
      var paper = graph.get("paper");

      var barwidth = barinfo.barwidth;
      var barPadding = barOption.barPadding;
      var that = this;
      var leftBottomY = chartBBox.top + chartBBox.height ;
      K.each(points,function(p){
        var y = chartBBox.top + chartBBox.height - p.y; // 左下角的y
        var x = p.x+barPadding+chartBBox.left; // 左下角x
        // paper.circle(x,p.y,5);
        // paper.text(x,p.y,p.xstring);
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
