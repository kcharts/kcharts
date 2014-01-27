/**
 * 网格
 * */
KISSY.add("gallery/kcharts/2.0/w-grid/index",function(S,Base,BaseUtil){
  //==================== Util ====================

  //==================== Class Grid ====================
  var Grid = Base.extend({
    initializer:function(){
    },
    /**
     * 类似 axis
     * chart.plug()调用时渲染
     * 依赖chart实现方法：
     *   1. getBBox，即chart盒子
     * 依赖chart属性：
     *   1. xrange
     *   2. yrange
     * */
    render:function(){
      var graph = this.get("graph");
      var chart = this.get("chart");
      var paper = graph.get("paper");

      if(!chart)
        return;

      var bbox = chart.getBBox();

      //==================== 绘制grid ====================
      // line 坐标轴示例
      //   │ B
      //   │
      //   │
      //   │
      //   │ A                 C
      // ─└──────────
      //   │
      //   │
      //   │
      //   │
      //
      var Ax = bbox.left;
      var Ay = bbox.top + bbox.height;
      var Bx = bbox.left;
      var By = bbox.top;
      var Cx = bbox.left + bbox.width;
      var Cy = bbox.top + bbox.height;

      // 竖直分割线
      var xrange = chart.get("xrange");
      var rullerPointsX = BaseUtil.getRullerPoints([Ax,Ay],[Cx,Cy],{
        n:xrange.length,
        scale:5
      });

      // 有多少条y轴？
      var axis
      axis  = this.get("yaxisNum");
      BaseUtil.drawGrid(bbox,rullerPointsX,{
        paper:paper,
        vertical:true,
        axis:axis,
        svg:window.Raphael.svg
      });

      // 水平分割线
      var yrange = chart.get("yrange");
      var rullerPointsY = BaseUtil.getRullerPoints([Ax,Ay],[Bx,By],{
        n:yrange.length,
        scale:5
      });

      // 有多少条y轴？
      axis  = this.get("xaxisNum");
      BaseUtil.drawGrid(bbox,rullerPointsY,{
        paper:paper,
        vertical:false,
        axis:axis,
        svg:window.Raphael.svg
      });
    },
    destroy:function(){

    }
  });
  return Grid;
},{
  requires:[
    "base",
    "gallery/kcharts/2.0/base/util"
  ]
});