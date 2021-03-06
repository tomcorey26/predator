'use strict';

const Sequelize = require('sequelize');
const JAVASCRIPT = 'javascript';
let client;

module.exports = {
    init,
    getAllProcessors,
    insertProcessor,
    getProcessorById,
    getProcessorByName,
    deleteProcessor,
    updateProcessor
};

async function init(sequelizeClient) {
    client = sequelizeClient;
    await initSchemas();
}

async function insertProcessor(processorId, processorInfo) {
    const processor = client.model('processor');
    const params = {
        id: processorId,
        name: processorInfo.name,
        description: processorInfo.description,
        javascript: processorInfo.javascript,
        exported_functions: processorInfo.exported_functions,
        created_at: Date.now(),
        updated_at: Date.now()
    };
    return processor.create(params);
}

async function getAllProcessors(from, limit, exclude) {
    const processorsModel = client.model('processor');
    const attributes = {};
    if (exclude && (exclude === JAVASCRIPT || exclude.includes(JAVASCRIPT))) {
        attributes.exclude = ['javascript'];
    }
    const allProcessors = processorsModel.findAll({ attributes, offset: from, limit, order: [['created_at', 'DESC']] });
    return allProcessors;
}

async function _getProcessor(options) {
    const processorsModel = client.model('processor');
    const processors = await processorsModel.findAll(options);
    return processors[0];
}

async function getProcessorById(processorId) {
    const options = {
        where: { id: processorId }
    };
    let processor = await _getProcessor(options);
    if (processor) {
        processor = processor.get();
    }
    return processor;
}

async function getProcessorByName(processorName) {
    const options = {
        where: { name: processorName }
    };
    return _getProcessor(options);
}

async function deleteProcessor(processorId) {
    const processorsModel = client.model('processor');
    return processorsModel.destroy({
        where: {
            id: processorId
        }
    });
}

async function updateProcessor(processorId, updatedProcessor) {
    const processorsModel = client.model('processor');
    const { name, description, javascript, exported_functions } = updatedProcessor;
    return processorsModel.update({ name, description, javascript, updated_at: Date.now(), exported_functions }, { where: { id: processorId } });
}

async function initSchemas() {
    const processorsFiles = client.define('processor', {
        id: {
            type: Sequelize.DataTypes.UUID,
            primaryKey: true
        },
        name: {
            type: Sequelize.DataTypes.TEXT('medium')
        },
        description: {
            type: Sequelize.DataTypes.TEXT('long')
        },
        javascript: {
            type: Sequelize.DataTypes.TEXT('long')
        },
        created_at: {
            type: Sequelize.DataTypes.DATE
        },
        updated_at: {
            type: Sequelize.DataTypes.DATE
        },
        exported_functions: {
            type: Sequelize.DataTypes.STRING,
            get: function() {
                return JSON.parse(this.getDataValue('exported_functions'));
            },
            set: function(val) {
                return this.setDataValue('exported_functions', JSON.stringify(val));
            }
        }
    });
    await processorsFiles.sync();
}
