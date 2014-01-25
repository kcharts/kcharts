/**
 * 坐标轴以及刻度
 * TODO 1. xaxis 和 yaxis 可以选择单独进行渲染 2. 销毁实例
 * */
KISSY.add("gallery/kcharts/2.0/w-axis/index",function(S,Base,BaseUtil){
  //==================== Util ====================

  // 默认连线样式
  // TODO 移到全局环境中去
  function getDefaultLineStyle(style){
    return S.merge({"stroke":"#999","stroke-width":"1"},style);
  }

  /**
   * 画刻度尺
   * @param collection {Array}
   * */
  function drawRullerPoints(collection,paper,opt){
    opt || (opt = {});
    if(arguments.length<2)
      return false;

    var style = opt.style || {};
    var joinStyle = style.ruller || "-."; // 连线样式

    var s = [];
    var p;
    var ax,bx,ay,by;
    for(var i=1,l=collection.length;i<l;i++){
      p = collection[i];

      if(joinStyle === '-.'){
        ax = p.x0;
        ay = p.y0;
        if(opt.xaxis){
          bx = p.x2;
          by = p.y2;
        }else{
          bx = p.x1;
          by = p.y1;
        }
      }else if(joinStyle === ".-"){
        if(opt.xaxis){
          ax = p.x0;ay=p.y0;
          bx = p.x2;by=p.y2;
        }else{
          ax = p.x0;ay=p.y0;
          bx = p.x1;by=p.y1;
        }
      }else if(joinStyle === "-.-"){
        ax = p.x1;ay=p.y1;
        bx = p.x2;by=p.y2;
      }else{
        return false;
      }
      s.push("M",
             BaseUtil.roundToFixed(ax,10),
             BaseUtil.roundToFixed(ay,10),
             "L",
             BaseUtil.roundToFixed(bx,10),
             BaseUtil.roundToFixed(by,10)
            );
    }
    var ss = s.join(',');
    var path = opt.path;
    if(path){
      path.animate({path:ss},200);
    }else{
      var sstyle = getDefaultLineStyle(style.style);
      path = paper.path(ss).attr(sstyle);
    }
    return path;
  }

  //==================== Class Axis ====================
  var Axis = Base.extend({
    initializer:function(){

    },
    /**
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

      //   │ B
      //   │
      //   │
      //   │
      //A1 │ A                 C
      // ─└──────────
      //   │A2
      //
      var Ax = bbox.left;
      var Ay = bbox.top + bbox.height;
      var A1x = Ax - 5;
      var A1y = Ay;
      var A2x = Ax;
      var A2y = Ay + 5;
      var Bx = bbox.left;
      var By = bbox.top; // TODO 如果有箭头样式要做fix
      var Cx = bbox.left + bbox.width; // TODO 如果有箭头样式要做fix
      var Cy = bbox.top + bbox.height;

      // x轴:x长一点
      paper.path(BaseUtil.polyLine([{x:A1x,y:A1y},{x:Cx+5,y:Cy}]));
      // y轴:y长一点
      paper.path(BaseUtil.polyLine([{x:A2x,y:A2y},{x:Bx,y:By-5}]));

      // tick标尺:x
      var xrange = chart.get("xrange");
      var rullerPointsX = BaseUtil.getRullerPoints([Ax,Ay],[Cx,Cy],{
        n:xrange.length,
        scale:5
      });
      drawRullerPoints(rullerPointsX,paper,{
        xaxis:true
      });

      // tick标尺:y
      var yrange = chart.get("yrange");
      var rullerPointsY = BaseUtil.getRullerPoints([Ax,Ay],[Bx,By],{
        n:yrange.length,
        scale:5
      });
      drawRullerPoints(rullerPointsY,paper,{
        yaxis:false
      });

    },
    destroy:function(){

    }
  });
  return Axis;
},{
  requires:[
    "base",
    "gallery/kcharts/2.0/base/util"
  ]
});