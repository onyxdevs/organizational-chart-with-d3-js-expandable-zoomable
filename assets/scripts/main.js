/*
Nugget Name: Organizational chart with D3.js, expandable, zoomable, and fully initialized (Holding Company Tree Chart)
Nugget URI: https://onyxdev.net/snippets-item/organizational-chart-with-d3-js-expandable-zoomable-and-fully-initialized/
Author: Obada Qawwas
Author URI: https://www.onyxdev.net/
Version: 1.0
Licensed under the MIT license - http://opensource.org/licenses/MIT
Copyright (c) 2020 Onyx Web Development
*/

/**
 * Check JS disabling
 */
(function () {
    const html = document.querySelector('html');
    if (html.classList.contains('no-js')) {
        html.classList.remove('no-js');
    }
})();

/**
 * Get the data from the window object
 */
const data = window.data;

/**
 * Organiztional chart functions
 */
Chart()
    .container('.chart-container')
    .data(data)
    .svgWidth(window.innerWidth)
    .svgHeight(window.innerHeight)
    .initialZoom(1)
    .onNodeClick((d) => console.log(d + ' node clicked'))
    .render();

function Chart() {
    // Exposed variables
    var attrs = {
        // Id is used for event handlings
        id: 'ID' + Math.floor(Math.random() * 1000000),
        svgWidth: 800,
        svgHeight: 600,
        marginTop: 100,
        marginBottom: 0,
        marginRight: 0,
        marginLeft: 0,
        container: 'body',
        defaultTextFill: '#2C3E50',
        nodeTextFill: 'black',
        defaultFont: "'Source Sans Pro', Arial, Helvetica, sans-serif",
        backgroundColor: '#e8e8e8',
        data: null,
        depth: 180,
        duration: 600,
        strokeWidth: 3,
        dropShadowId: null,
        initialZoom: 1,
        onNodeClick: (d) => d
    };

    // Inner functions which will update visuals
    var updateData;

    // Main chart object
    var main = function () {
        // Drawing containers
        var container = d3.select(attrs.container);
        var containerRect = container.node().getBoundingClientRect();
        if (containerRect.width > 0) attrs.svgWidth = containerRect.width;

        setDropShadowId(attrs);

        // Calculated properties
        var calc = {
            id: null,
            chartTopMargin: null,
            chartLeftMargin: null,
            chartWidth: null,
            chartHeight: null
        };

        calc.id = 'ID' + Math.floor(Math.random() * 1000000); // id for event handlings
        calc.chartLeftMargin = attrs.marginLeft;
        calc.chartTopMargin = attrs.marginTop;
        calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
        calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;
        calc.nodeMaxWidth = d3.max(attrs.data, (d) => d.width);
        calc.nodeMaxHeight = d3.max(attrs.data, (d) => d.height);

        attrs.depth = calc.nodeMaxHeight + 100;

        calc.centerX = calc.chartWidth / 2;

        //********************  LAYOUTS  ***********************
        const layouts = {
            treemap: null
        };

        layouts.treemap = d3
            .tree()
            .size([calc.chartWidth, calc.chartHeight])
            .nodeSize([calc.nodeMaxWidth + 100, calc.nodeMaxHeight + attrs.depth]);

        // ******************* BEHAVIORS **********************
        const behaviors = {
            zoom: null
        };

        behaviors.zoom = d3.zoom().on('zoom', zoomed);

        //****************** ROOT node work ************************
        const root = d3
            .stratify()
            .id((d) => d.nodeId)
            .parentId((d) => d.parentNodeId)(attrs.data);

        root.x0 = 0;
        root.y0 = 0;

        const allNodes = layouts.treemap(root).descendants();

        allNodes.forEach((d) => {
            Object.assign(d.data, {
                directSubsidiaries: d.children ? d.children.length : 0,
                totalSubsidiaries: d.descendants().length - 1
            });
        });

        root.children.forEach(collapse);
        root.children.forEach(expandSomeNodes);

        // Add svg
        var svg = container
            .patternify({
                tag: 'svg',
                selector: 'tree-chart'
            })
            .attr('width', attrs.svgWidth)
            .attr('height', attrs.svgHeight)
            .attr('font-family', attrs.defaultFont)
            .call(behaviors.zoom)
            .attr('cursor', 'move')
            .style('background-color', attrs.backgroundColor);

        // Add container g element
        var chart = svg
            .patternify({
                tag: 'g',
                selector: 'chart'
            })
            .attr('transform', 'translate(' + calc.chartLeftMargin + ',' + calc.chartTopMargin + ')');

        var centerG = chart
            .patternify({
                tag: 'g',
                selector: 'center-group'
            })
            .attr('transform', `translate(${calc.centerX},${calc.nodeMaxHeight / 2}) scale(${attrs.initialZoom})`);

        if (attrs.lastTransform) {
            behaviors.zoom.scaleBy(chart, attrs.lastTransform.k).translateTo(chart, attrs.lastTransform.x, attrs.lastTransform.y);
        }

        const defs = svg.patternify({
            tag: 'defs',
            selector: 'image-defs'
        });

        const filterDefs = svg.patternify({
            tag: 'defs',
            selector: 'filter-defs'
        });

        var filter = filterDefs
            .patternify({ tag: 'filter', selector: 'shadow-filter-element' })
            .attr('id', attrs.dropShadowId)
            .attr('y', `${-50}%`)
            .attr('x', `${-50}%`)
            .attr('height', `${200}%`)
            .attr('width', `${200}%`);

        filter.patternify({ tag: 'feGaussianBlur', selector: 'feGaussianBlur-element' }).attr('in', 'SourceAlpha').attr('stdDeviation', 3.1).attr('result', 'blur');

        filter
            .patternify({ tag: 'feOffset', selector: 'feOffset-element' })
            .attr('in', 'blur')
            .attr('result', 'offsetBlur')
            .attr('dx', 4.28)
            .attr('dy', 4.48)
            .attr('x', 8)
            .attr('y', 8);

        filter
            .patternify({ tag: 'feFlood', selector: 'feFlood-element' })
            .attr('in', 'offsetBlur')
            .attr('flood-color', 'black')
            .attr('flood-opacity', 0.3)
            .attr('result', 'offsetColor');

        filter
            .patternify({ tag: 'feComposite', selector: 'feComposite-element' })
            .attr('in', 'offsetColor')
            .attr('in2', 'offsetBlur')
            .attr('operator', 'in')
            .attr('result', 'offsetBlur');

        var feMerge = filter.patternify({ tag: 'feMerge', selector: 'feMerge-element' });

        feMerge.patternify({ tag: 'feMergeNode', selector: 'feMergeNode-blur' }).attr('in', 'offsetBlur');

        feMerge.patternify({ tag: 'feMergeNode', selector: 'feMergeNode-graphic' }).attr('in', 'SourceGraphic');

        // Display tree contenrs
        update(root);

        // Smoothly handle data updating
        updateData = () => {};

        //********************  UTILITY FUNCTIONS  ***********************
        function setDropShadowId(d) {
            if (d.dropShadowId) return;

            let id = d.id + '-drop-shadow';
            //@ts-ignore
            if (typeof DOM != 'undefined') {
                //@ts-ignore
                id = DOM.uid(d.id).id;
            }
            Object.assign(d, {
                dropShadowId: id
            });
        }

        function rgbaObjToColor(d) {
            return `rgba(${d.red},${d.green},${d.blue},${d.alpha})`;
        }

        // Zoom handler function
        function zoomed() {
            var transform = d3.event.transform;
            attrs.lastTransform = transform;
            chart.attr('transform', transform);
        }

        // Toggle children on click.
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(d);
        }

        function diagonal(s, t) {
            const x = s.x;
            const y = s.y;
            const ex = t.x;
            const ey = t.y;

            let xrvs = ex - x < 0 ? -1 : 1;
            let yrvs = ey - y < 0 ? -1 : 1;

            let rdef = 35;
            let r = Math.abs(ex - x) / 2 < rdef ? Math.abs(ex - x) / 2 : rdef;

            r = Math.abs(ey - y) / 2 < r ? Math.abs(ey - y) / 2 : r;

            let h = Math.abs(ey - y) / 2 - r;
            let w = Math.abs(ex - x) - r * 2;
            const path = `
            M ${x} ${y}
            L ${x} ${y + h * yrvs}
            C  ${x} ${y + h * yrvs + r * yrvs} ${x} ${y + h * yrvs + r * yrvs} ${x + r * xrvs} ${y + h * yrvs + r * yrvs}
            L ${x + w * xrvs + r * xrvs} ${y + h * yrvs + r * yrvs}
            C ${ex}  ${y + h * yrvs + r * yrvs} ${ex}  ${y + h * yrvs + r * yrvs} ${ex} ${ey - h * yrvs}
            L ${ex} ${ey}`;
            return path;
        }

        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        function expandSomeNodes(d) {
            if (d.data.expanded) {
                let parent = d.parent;
                while (parent) {
                    if (parent._children) {
                        parent.children = parent._children;
                    }
                    parent = parent.parent;
                }
            }
            if (d._children) {
                d._children.forEach(expandSomeNodes);
            }
        }

        function update(source) {
            // Assigns the x and y position for the nodes

            const treeData = layouts.treemap(root);

            // Get tree nodes and links
            const nodes = treeData.descendants().map((d) => {
                if (d.width) return d;

                let imageWidth = d.data.nodeImage.width;
                let imageHeight = d.data.nodeImage.height;
                let imageBorderColor = d.data.nodeImage.borderColor;
                let imageBorderWidth = d.data.nodeImage.borderWidth;
                let imageRx = 0;
                let imageCenterTopDistance = d.data.nodeImage.centerTopDistance;
                let imageCenterLeftDistance = d.data.nodeImage.centerLeftDistance;
                let borderColor = d.data.borderColor;
                let backgroundColor = d.data.backgroundColor;
                let width = d.data.width;
                let height = d.data.height;
                let dropShadowId = `none`;
                if (d.data.nodeImage && d.data.nodeImage.shadow) {
                    dropShadowId = `url(#${attrs.dropShadowId})`;
                }
                if (d.data.nodeImage && d.data.nodeImage.width) {
                    imageWidth = d.data.nodeImage.width;
                }
                if (d.data.nodeImage && d.data.nodeImage.height) {
                    imageHeight = d.data.nodeImage.height;
                }
                if (d.data.nodeImage && d.data.nodeImage.borderColor) {
                    imageBorderColor = rgbaObjToColor(d.data.nodeImage.borderColor);
                }
                if (d.data.nodeImage && d.data.nodeImage.borderWidth) {
                    imageBorderWidth = d.data.nodeImage.borderWidth;
                }
                if (d.data.nodeImage && d.data.nodeImage.centerTopDistance) {
                    imageCenterTopDistance = d.data.nodeImage.centerTopDistance;
                }
                if (d.data.nodeImage && d.data.nodeImage.centerLeftDistance) {
                    imageCenterLeftDistance = d.data.nodeImage.centerLeftDistance;
                }
                if (d.data.borderColor) {
                    borderColor = rgbaObjToColor(d.data.borderColor);
                }
                if (d.data.backgroundColor) {
                    backgroundColor = rgbaObjToColor(d.data.backgroundColor);
                }
                if (d.data.nodeImage && d.data.nodeImage.cornerShape.toLowerCase() == 'circle') {
                    imageRx = Math.max(imageWidth, imageHeight);
                }
                if (d.data.nodeImage && d.data.nodeImage.cornerShape.toLowerCase() == 'rounded') {
                    imageRx = Math.min(imageWidth, imageHeight) / 6;
                }
                return Object.assign(d, {
                    imageWidth,
                    imageHeight,
                    imageBorderColor,
                    imageBorderWidth,
                    borderColor,
                    backgroundColor,
                    imageRx,
                    width,
                    height,
                    imageCenterTopDistance,
                    imageCenterLeftDistance,
                    dropShadowId
                });
            });

            const links = treeData.descendants().slice(1);

            // Set constant depth for each nodes
            nodes.forEach((d) => (d.y = d.depth * attrs.depth));

            //********************  FILTERS  ***********************

            const patternsSelection = defs.selectAll('.pattern').data(nodes, (d) => d.id);

            const patternEnterSelection = patternsSelection.enter().append('pattern');

            const patterns = patternEnterSelection
                .merge(patternsSelection)
                .attr('class', 'pattern')
                .attr('height', 1)
                .attr('width', 1)
                .attr('id', (d) => d.id);

            patterns
                .patternify({
                    tag: 'image',
                    selector: 'pattern-image',
                    data: (d) => [d]
                })
                .attr('x', 0)
                .attr('y', 0)
                .attr('height', (d) => d.imageHeight)
                .attr('width', (d) => d.imageWidth)
                .attr('xlink:href', (d) => d.data.nodeImage.url)
                .attr('viewbox', (d) => `0 0 ${d.imageWidth * 2} ${d.imageHeight}`)
                .attr('preserveAspectRatio', 'xMidYMin slice');

            patternsSelection.exit().transition().duration(attrs.duration).remove();

            //********************  LINKS  ***********************

            // Update the links...
            var linkSelection = centerG.selectAll('path.link').data(links, (d) => d.id);

            // Enter any new links at the parent's previous position.
            var linkEnter = linkSelection
                .enter()
                .insert('path', 'g')
                .attr('class', 'link')
                .attr('d', (d) => {
                    var o = {
                        x: source.x0,
                        y: source.y0
                    };
                    return diagonal(o, o);
                });

            // UPDATE
            var linkUpdate = linkEnter.merge(linkSelection);

            // Styling links
            linkUpdate
                .attr('fill', 'none')
                .attr('stroke-width', (d) => d.data.connectorLineWidth || 2)
                .attr('stroke', (d) => d.data.connectorLineColor)
                .attr('stroke-dasharray', (d) => {
                    if (d.data.dashArray) {
                        return d.data.dashArray;
                    }
                    return '';
                });

            // Transition back to the parent element position
            linkUpdate
                .transition()
                .duration(attrs.duration)
                .attr('d', (d) => diagonal(d, d.parent));

            // Remove any exiting links
            linkSelection
                .exit()
                .transition()
                .duration(attrs.duration)
                .attr('d', (d) => {
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal(o, o);
                })
                .remove();

            //********************  NODES  ***********************
            // Updating nodes
            const nodesSelection = centerG.selectAll('g.node').data(nodes, (d) => d.id);

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = nodesSelection
                .enter()
                .append('g')
                .attr('class', (d) => (d.data.totalSubsidiaries === 0 ? 'node node--no-subsidiaries' : 'node'))
                .attr('transform', (d) => 'translate(' + source.x0 + ',' + source.y0 + ')')
                .attr('cursor', 'pointer')
                .on('click', (d) => {
                    if ([...d3.event.srcElement.classList].includes('node-button-circle')) {
                        return;
                    }
                    attrs.onNodeClick(d.data.nodeId);
                });

            // Add rectangle for the nodes
            nodeEnter
                .patternify({
                    tag: 'rect',
                    selector: 'node-rect',
                    data: (d) => [d]
                })
                .attr('width', 1e-6)
                .attr('height', 1e-6)
                .style('fill', (d) => (d._children ? 'lightsteelblue' : '#fff'));

            // Add foreignObject element
            const fo = nodeEnter
                .patternify({
                    tag: 'foreignObject',
                    selector: 'node-foreign-object',
                    data: (d) => [d]
                })
                .attr('width', (d) => d.width)
                .attr('height', (d) => d.height)
                .attr('x', (d) => -d.width / 2)
                .attr('y', (d) => -d.height / 2);

            // Add foreign object
            fo.patternify({
                tag: 'xhtml:div',
                selector: 'node-foreign-object-div',
                data: (d) => [d]
            })
                .style('width', (d) => d.width + 'px')
                .style('height', (d) => d.height + 'px')
                .style('color', 'black')
                .html((d) => d.data.template);

            nodeEnter
                .patternify({
                    tag: 'image',
                    selector: 'node-icon-image',
                    data: (d) => [d]
                })
                .attr('width', (d) => d.data.nodeIcon.size)
                .attr('height', (d) => d.data.nodeIcon.size)
                .attr('xlink:href', (d) => d.data.nodeIcon.icon)
                .attr('x', (d) => -d.width / 2 + 14)
                .attr('y', (d) => d.height / 2 - d.data.nodeIcon.size - 8);

            // Subsidiaries
            nodeEnter
                .patternify({
                    tag: 'text',
                    selector: 'node-icon-text-total',
                    data: (d) => [d]
                })
                .text('test')
                .attr('x', (d) => -d.width / 2 + 14)
                .attr('y', (d) => d.height / 2 - d.data.nodeIcon.size - 8)
                .text((d) => d.data.totalSubsidiaries + (d.data.totalSubsidiaries === 1 ? ' Subsidiary' : ' Subsidiaries'))
                .attr('fill', attrs.nodeTextFill)
                .attr('font-weight', '600')
                .attr('font-family', attrs.defaultFont);

            nodeEnter
                .patternify({
                    tag: 'text',
                    selector: 'node-icon-text-direct',
                    data: (d) => [d]
                })
                .text('test')
                .attr('x', (d) => -d.width / 2 + 14 + 6 + d.data.nodeIcon.size)
                .attr('y', (d) => d.height / 2 - 14)
                .text((d) => d.data.directSubsidiaries + ' Direct ')
                .attr('fill', attrs.nodeTextFill)
                .attr('font-weight', '600')
                .attr('font-family', attrs.defaultFont);

            // Node images
            const nodeImageGroups = nodeEnter.patternify({
                tag: 'g',
                selector: 'node-image-group',
                data: (d) => [d]
            });

            // Node image rectangle
            nodeImageGroups.patternify({
                tag: 'rect',
                selector: 'node-image-rect',
                data: (d) => [d]
            });

            // Node button circle group
            const nodeButtonGroups = nodeEnter
                .patternify({
                    tag: 'g',
                    selector: 'node-button-g',
                    data: (d) => [d]
                })
                .on('click', click);

            // Add button circle
            nodeButtonGroups.patternify({
                tag: 'circle',
                selector: 'node-button-circle',
                data: (d) => [d]
            });

            // Add button text
            nodeButtonGroups
                .patternify({
                    tag: 'text',
                    selector: 'node-button-text',
                    data: (d) => [d]
                })
                .attr('pointer-events', 'none');

            // Node update styles
            var nodeUpdate = nodeEnter.merge(nodesSelection).style('font', '12px sans-serif');

            // Transition to the proper position for the node
            nodeUpdate
                .transition()
                .attr('opacity', 0)
                .duration(attrs.duration)
                .attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')')
                .attr('opacity', 1);

            // Move images to desired positions
            nodeUpdate.selectAll('.node-image-group').attr('transform', (d) => {
                let x = -d.imageWidth / 2.25 - d.width / 2.25;
                let y = -d.imageHeight / 2.25 - d.height / 2.25;
                return `translate(${x},${y})`;
            });

            nodeUpdate
                .select('.node-image-rect')
                .attr('fill', (d) => `url(#${d.id})`)
                .attr('width', (d) => d.imageWidth)
                .attr('height', (d) => d.imageHeight)
                .attr('stroke', (d) => d.imageBorderColor)
                .attr('stroke-width', (d) => d.imageBorderWidth)
                .attr('rx', (d) => d.imageRx)
                .attr('y', (d) => d.imageCenterTopDistance)
                .attr('x', (d) => d.imageCenterLeftDistance)
                .attr('filter', (d) => d.dropShadowId);

            // Update  node attributes and style
            nodeUpdate
                .select('.node-rect')
                .attr('width', (d) => d.data.width)
                .attr('height', (d) => d.data.height)
                .attr('x', (d) => -d.data.width / 2)
                .attr('y', (d) => -d.data.height / 2)
                .attr('rx', (d) => d.data.borderRadius || 0)
                .attr('stroke-width', (d) => d.data.borderWidth || attrs.strokeWidth)
                .attr('cursor', 'pointer')
                .attr('stroke', (d) => d.borderColor)
                .style('fill', (d) => d.backgroundColor);

            // Move node button group to the desired position
            nodeUpdate
                .select('.node-button-g')
                .attr('transform', (d) => {
                    return `translate(0,${d.data.height / 2})`;
                })
                .attr('opacity', (d) => {
                    if (d.children || d._children) {
                        return 1;
                    }
                    return 0;
                });

            // Restyle node button circle
            nodeUpdate
                .select('.node-button-circle')
                .attr('r', 16)
                .attr('stroke-width', (d) => d.data.borderWidth || attrs.strokeWidth)
                .attr('fill', 'rgba(255,255,255,1)')
                .attr('stroke', (d) => d.borderColor);

            // Restyle texts
            nodeUpdate
                .select('.node-button-text')
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .attr('fill', attrs.defaultTextFill)
                .attr('transform', (d) => 'translate(0, 1)')
                .attr('font-size', (d) => {
                    if (d.children) return 34;
                    return 20;
                })
                .text((d) => {
                    if (d.children) return '-';
                    return '+';
                });

            // Remove any exiting nodes
            var nodeExitTransition = nodesSelection
                .exit()
                .attr('opacity', 1)
                .transition()
                .duration(attrs.duration)
                .attr('transform', (d) => 'translate(' + source.x + ',' + source.y + ')')
                .on('end', function () {
                    d3.select(this).remove();
                })
                .attr('opacity', 0);

            // On exit reduce the node rects size to 0
            nodeExitTransition.selectAll('.node-rect').attr('width', 10).attr('height', 10).attr('x', 0).attr('y', 0);

            // On exit reduce the node image rects size to 0
            nodeExitTransition
                .selectAll('.node-image-rect')
                .attr('width', 10)
                .attr('height', 10)
                .attr('x', (d) => d.width / 2)
                .attr('y', (d) => d.height / 2);

            // Store the old positions for transition.
            nodes.forEach((d) => {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        d3.select(window).on('resize.' + attrs.id, function () {
            // var containerRect = container.node().getBoundingClientRect();
            //	if (containerRect.width > 0) attrs.svgWidth = containerRect.width;
            //	main();
        });
    };

    //********************  PROTOTYPE FUNCTIONS  ***********************
    d3.selection.prototype.patternify = function (params) {
        var container = this;
        var selector = params.selector;
        var elementTag = params.tag;
        var data = params.data || [selector];

        // Pattern in action
        var selection = container.selectAll('.' + selector).data(data, (d, i) => {
            if (typeof d === 'object') {
                if (d.id) {
                    return d.id;
                }
            }
            return i;
        });
        selection.exit().remove();
        selection = selection.enter().append(elementTag).merge(selection);
        selection.attr('class', selector);
        return selection;
    };

    // Dynamic keys functions
    Object.keys(attrs).forEach((key) => {
        // Attach variables to main function
        //@ts-ignore
        main[key] = function (_) {
            var string = `attrs['${key}'] = _`;
            if (!arguments.length) {
                return eval(` attrs['${key}'];`);
            }
            eval(string);
            return main;
        };
        return main;
    });

    //Set attrs as property
    //@ts-ignore
    main['attrs'] = attrs;

    //Exposed update functions
    //@ts-ignore
    main['data'] = function (value) {
        if (!arguments.length) return attrs.data;
        attrs.data = value;
        if (typeof updateData === 'function') {
            updateData();
        }
        return main;
    };

    // Run  visual
    //@ts-ignore
    main['render'] = function () {
        main();
        return main;
    };

    return main;
}
