/*
Nugget Name: Organizational chart with D3.js, expandable, zoomable, and fully initialized (Holding Company Tree Chart)
Nugget URI: https://onyxdev.net/snippets-item/organizational-chart-with-d3-js-expandable-zoomable-and-fully-initialized/
Author: Obada Qawwas
Author URI: https://www.onyxdev.net/
Version: 1.0
Licensed under the MIT license - http://opensource.org/licenses/MIT
Copyright (c) 2020 Onyx Web Development
*/

// Set default values to change all nodes from one place
const cardDefaults = {
    width: 324,
    height: 132,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: { red: 0, green: 0, blue: 0, alpha: 0.1 },
    backgroundColor: { red: 255, green: 255, blue: 255, alpha: 1 },
    connectorLineColor: '#d8d7d7',
    connectorLineWidth: 3,
    dashArray: '',
    expanded: false
};
const nodeImageDefaults = {
    width: 94,
    height: 60,
    centerTopDistance: 0,
    centerLeftDistance: 0,
    cornerShape: 'ROUNDED',
    shadow: false,
    borderWidth: 1,
    borderColor: { red: 0, green: 0, blue: 0, alpha: 0.15 }
};
const nodeIconDefault = { icon: './assets/media/companies-tree.svg', size: 24 };

const templateDefault = (title, afterTitle, share) => {
    // Throw error if there was no title
    if (!title) throw new Error('You have to provide a title!');

    let output = '<div class="tree-chart__card">\n';

    if (title) {
        output += `<div class="tree-chart__card__title">${title}</div>`;
    }
    if (afterTitle) {
        output += `<div class="tree-chart__card__after-title">${afterTitle}</div>\n`;
    }
    if (share) {
        output += `<div class="tree-chart__card__share">${share}</div>\n`;
    }

    output += '</div>';

    return output;
};

// Nodes data
window.data = [
    {
        nodeId: 'O-1',
        parentNodeId: null,
        nodeImage: { url: './assets/media/logo.jpg' },
        template: templateDefault('Company name', 'Revenue: $100.000.000')
    },

    {
        nodeId: '1-1',
        parentNodeId: 'O-1',
        nodeImage: { url: './assets/media/logo.jpg' },
        template: templateDefault('Company name', 'Revenue: $100.000.000', '%100')
    },
    {
        nodeId: '1-1-1',
        parentNodeId: '1-1',
        nodeImage: { url: './assets/media/logo.jpg' },
        template: templateDefault('Company name', 'Revenue: $100.000.000', '%100')
    },
    {
        nodeId: '1-1-2',
        parentNodeId: '1-1',
        nodeImage: { url: './assets/media/logo.jpg' },
        template: templateDefault('Company name', 'Revenue: $100.000.000', '%100')
    },

    {
        nodeId: '1-2',
        parentNodeId: 'O-1',
        nodeImage: { url: './assets/media/logo.jpg' },
        template: templateDefault('Company name', 'Revenue: $100.000.000', '%100')
    },
    {
        nodeId: '1-2-1',
        parentNodeId: '1-2',
        nodeImage: { url: './assets/media/logo.jpg' },
        template: templateDefault('Company name', 'Revenue: $100.000.000', '%100')
    },
    {
        nodeId: '1-2-2',
        parentNodeId: '1-2',
        nodeImage: { url: './assets/media/logo.jpg' },
        template: templateDefault('Company name', 'Revenue: $100.000.000', '%100')
    },

    {
        nodeId: '1-3',
        parentNodeId: 'O-1',
        nodeImage: { url: './assets/media/logo.jpg' },
        template: templateDefault('Company name', 'Revenue: $100.000.000', '%100')
    },
    {
        nodeId: '1-3-1',
        parentNodeId: '1-3',
        nodeImage: { url: './assets/media/logo.jpg' },
        template: templateDefault('Company name', 'Revenue: $100.000.000', '%100')
    },
    {
        nodeId: '1-3-2',
        parentNodeId: '1-3',
        nodeImage: { url: './assets/media/logo.jpg' },
        template: templateDefault('Company name', 'Revenue: $100.000.000', '%100')
    },
    {
        nodeId: '1-3-2-1',
        parentNodeId: '1-3-2',
        nodeImage: { url: './assets/media/logo.jpg' },
        template: templateDefault('Company name', 'Revenue: $100.000.000', '%100')
    },

    {
        nodeId: '1-4',
        parentNodeId: 'O-1',
        nodeImage: { url: './assets/media/logo.jpg' },
        template: templateDefault('Company name', 'Revenue: $100.000.000', '%100')
    },
    {
        nodeId: '1-4-1',
        parentNodeId: '1-4',
        nodeImage: { url: './assets/media/logo.jpg' },
        template: templateDefault('Company name', 'Revenue: $100.000.000', '%100')
    },
    {
        nodeId: '1-4-2',
        parentNodeId: '1-4',
        nodeImage: { url: './assets/media/logo.jpg' },
        template: templateDefault('Company name', 'Revenue: $100.000.000', '%100')
    }
].map((node) => {
    // Set default values to not repeat them in each node
    // Node's default values
    const defaultKeys = {
        width: cardDefaults.width,
        height: cardDefaults.height,
        borderWidth: cardDefaults.borderWidth,
        borderRadius: cardDefaults.borderRadius,
        borderColor: cardDefaults.borderColor,
        backgroundColor: cardDefaults.backgroundColor,
        nodeImage: {
            width: nodeImageDefaults.width,
            height: nodeImageDefaults.height,
            centerTopDistance: nodeImageDefaults.centerTopDistance,
            centerLeftDistance: nodeImageDefaults.centerLeftDistance,
            cornerShape: nodeImageDefaults.cornerShape,
            shadow: nodeImageDefaults.shadow,
            borderWidth: nodeImageDefaults.borderWidth,
            borderColor: nodeImageDefaults.borderColor
        },
        nodeIcon: nodeIconDefault,
        connectorLineColor: cardDefaults.connectorLineColor,
        connectorLineWidth: cardDefaults.connectorLineWidth,
        dashArray: cardDefaults.dashArray,
        expanded: cardDefaults.expanded
    };

    // Set node's root default values
    Object.keys(defaultKeys).map((key) => {
        if (!node[key]) {
            node[key] = defaultKeys[key];
        }
    });

    // Set nodeImage default values
    Object.keys(defaultKeys.nodeImage).map((key) => {
        if (!node.nodeImage[key]) {
            node.nodeImage[key] = defaultKeys.nodeImage[key];
        }
    });

    return node;
});
