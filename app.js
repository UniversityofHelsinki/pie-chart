var sampleData = [{
  'Title': 'Kandidaatiksi',
  'Value': 18691
}, {
  'Title': 'Maisteriksi',
  'Value': 9494
}, {
  'Title': 'Lisensiaatiksi',
  'Value': 235
}, {
  'Title': 'Tohtoriksi',
  'Value': 4682
}];

pie("#pie-chart", sampleData, 'Opiskelijoita yht.');

/* *** */

function pie(selector, data, titleText) {

  var keys = makeKeys(data);
  var values = makeValues(data);
  var totalValues = sum(values);
  var normalizedValues = normalize(values, totalValues);

  var colors = ["#44a999", "#0f4073", "#89cbee", "#98cd65", "#7b46a2"];

  var color = d3.scale.ordinal().range(colors);

  function makeKeys(data) {
    var output = [];
    return data.map(function(d) {
      for (var key in d) {
        return String(key) + " " + String(d[key]);
      }
    });
  }

  function render() {
    var arcTween = function(a) {
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function(t) {
        return arc(i(t));
      };
    }

    var pie = d3.select(selector);

    // Measurements
    var width = pie.node().getBoundingClientRect().width;
    var pieDiameter = width/2.5;

    var legendTextHeight = width/24;
    var textSpacing = 1.5 * (legendTextHeight);

    var topTitleTextHeight = legendTextHeight;
    var topTitleHeight = legendTextHeight * 1.2;

    var legend_x = pieDiameter/1.75;
    var legendHeight = ((textSpacing * data.length) + topTitleHeight ) * 1.05;
    var height = Math.max(pieDiameter, legendHeight);

    var top_y = -height/2.4;

    // set the thickness of the inner and outer radii
    var oRadius = pieDiameter / 2 * 0.9;
    var iRadius = pieDiameter / 2 * 0.45;

    var duration = 1000;

    pie.selectAll('svg').remove();

    var svg = pie
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // construct default pie laoyut
    var pie = d3.layout.pie().value(function(d) {
      return d;
    }).sort(null);

    // construct arc generator
    var arc = d3.svg.arc()
      .outerRadius(oRadius)
      .innerRadius(iRadius);

    // creates the pie chart container
    var g = svg.append('g')
      .attr('transform', function() {
        return 'translate(' + pieDiameter / 2 + ',' + height / 2 + ')';
      });

    var empty = makeEmpty(data.length);

    var path = g.datum(empty)
      .selectAll("path")
      .data(pie)
      .enter()
      .append("path")
      .attr("class", "piechart")
      .attr("fill", function(d, i) {
        return color(i);
      })
      .attr("d", arc)
      .each(function(d) {
        this._current = d;
      })

    var text = g.selectAll("text")
      .data(data)
      .enter();


    text.append("rect")
      .attr("width", legendTextHeight)
      .attr("height", legendTextHeight)
      .attr("x", legend_x)
      .attr("y", function(d, i) {
        return top_y + (textSpacing * i) + topTitleHeight*1.2 + legendTextHeight/8;
      })
      .attr("fill", function(d, i) {
        return color(i);
      })
      .text(function(d) {
        return d['Title'];
      })
      .attr("opacity", 0)
      .transition()
      .duration(function(d, i) {
        return duration - (1 - (i+1)/data.length)*duration;
      })
      .attr("opacity", 1) ;


    text.append("text")
      .style('font-family', 'Open Sans')
      .style('font-weight', 'bold')
      .style('font-size', legendTextHeight + 'px')
      .attr("x", width-legend_x)
      .attr("text-anchor", "end")
      .attr("y", function(d, i) {
        return top_y + (textSpacing * i) + legendTextHeight + topTitleHeight*1.2;
      })
      .attr("fill", function(d, i) {
        return d3.hcl(color(i)).darker(1);
      })
      .text(function(d) {
        return d['Value'];
      })
      .attr("opacity", 0)
      .transition()
      .duration(function(d, i) {
        return duration - (1 - (i+1)/data.length)*duration;
      })
        .attr("opacity", 1);

    text.append("text")
      .style('font-family', 'Open Sans')
      .style('font-size', legendTextHeight + 'px')
      .style('font-weight', 'light')
      .attr("x", legend_x + legendTextHeight*1.5)
      .attr("y", function(d, i) {
        return top_y + (textSpacing * i) + legendTextHeight + topTitleHeight*1.2;
      })
      .attr("fill", function(d, i) {
        return d3.hcl(color(i)).darker(1);
      })
      .text(function(d) {
        return d['Title'];
      })
      .attr("opacity", 0)
      .transition()
      .duration(function(d, i) {
        return duration - (1 - (i+1)/data.length)*duration;
      })
      .attr("opacity", 1);

    g.append("text")
      .style('font-family', 'Open Sans')
      .style('font-size', topTitleTextHeight + 'px')
      .style('font-weight', 'bold')
      .attr("x", legend_x)
      .attr("y", top_y + topTitleHeight - topTitleTextHeight / 1.5)
      .attr("fill", "#222")
      .text(titleText)
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .attr("opacity", 1);

    g.append("text")
      .style('font-family', 'Open Sans')
      .style('font-size', topTitleTextHeight + 'px')
      .style('font-weight', 'bold')
      .attr("x", width - legend_x)
      .attr("y", top_y + topTitleHeight - topTitleTextHeight / 1.5)
      .attr("fill", "#222")
      .attr("text-anchor", "end")
      .text(totalValues)
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .attr("opacity", 1);

    // add transition to new path
    g.datum(normalizedValues).selectAll("path")
      .data(pie)
      .transition()
      .duration(1000)
      .attrTween("d", arcTween);

    // add any new paths
    g.datum(normalizedValues).selectAll("path")
      .data(pie)
      .enter().append("path")
      .attr("class", "piechart")
      .attr("fill", function(d, i) {
        return color(i);
      })
      .attr("d", arc)
      .each(function(d) {
        this._current = d;
      });

    // remove data not being used
    g.datum(normalizedValues).selectAll("path")
      .data(pie).exit().remove();
  }


  function makeEmpty(size) {
    return d3.range(size).map(function(item) {
      return 0;
    });
  }


  function sum(values) {
    return values.reduce(function(prev, curr) {
      return prev + curr;
    });
  }


  function makeValues(input) {
    return input.map(function(d) {
      return d['Value'];
    });
  }


  function makeKeys(input) {
    return input.map(function(d) {
      return d['Title'];
    });
  }


  function normalize(values, totalSum) {
    return values.map(function(d) {
      return (d / totalSum) * 100;
    });
  }

  render();

  d3.select(window).on('resize.' + selector, function() {
    render();
  });

}
