/**
 * overview 图表基础类
 * */
KISSY.add("gallery/kcharts/2.0/base/index",function(S){
  var Base = S.require("base");

  var BaseChart = Base.extend({
    // 添加widget
    plug:function(widget){
      var graph = this.get("graph");
      var chart = this;

      widget.set({
        graph:graph,
        chart:chart
      });

      widget.render();
    },
    // 移除widget
    unplug:function(){},
    //==================== 基础方法 start ====================
    // 设置图表的绘制区域，多个图表混搭的时候，需要手动设置参数，比如图表的左上角x、y，图表的宽高；单个图表默认占据整个容器
    getBBox:function(){
      var graph = this.get("graph");
      var gwidth = graph.get("containerWidth");
      var gheight = graph.get("containerHeight");
      var pd = this.getPadding();
      var bbox = {
        left:pd.paddingLeft,
        top :pd.paddingTop,
        width:gwidth - pd.paddingLeft - pd.paddingRight,
        height:gheight - pd.paddingTop - pd.paddingBottom
      }
      return bbox;
    },
    getPadding:function(){
      return {
        paddingTop:30,
        paddingRight:30,
        paddingBottom:30,
        paddingLeft:30
      };
    }
    //==================== 基础方法 end ====================
  });

  return BaseChart;
});
