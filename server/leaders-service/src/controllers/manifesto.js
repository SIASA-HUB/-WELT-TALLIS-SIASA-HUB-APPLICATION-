const Logger = require('../../src/utils/logger/logger');
const asyncHandler = require('express-async-handler');
const { getKenyaTimeISO } = require('../utils/timestamps/timeStamp');
const { randomUUID } = require('crypto'); // correct way to get UUID

function generateManifestoId() {
    return randomUUID();
}


const createManifesto = asyncHandler(async (req, res) => {
    const { leader_id, main_agenda, agenda_items, pdf_url } = req.body;

    if (!leader_id || !main_agenda || !agenda_items || !pdf_url) {
        res.status(400);
        throw new Error('All manifesto fields are required');
    }

    const manifesto_id = generateManifestoId();
    const created_at = getKenyaTimeISO();

    // Assuming you have a database connection (e.g., using knex or mysql2)
    await db.query(
        `INSERT INTO manifestos (manifesto_id, leader_id, main_agenda, agenda_items, pdf_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [manifesto_id, leader_id, main_agenda, JSON.stringify(agenda_items), pdf_url, created_at]
    );

    Logger.info(`Manifesto created with ID: ${manifesto_id}`);

    res.status(201).json({ manifesto_id, leader_id, main_agenda, agenda_items, pdf_url, created_at });
});

/**
 * Edit an existing manifesto
 */
const editManifesto = asyncHandler(async (req, res) => {
    const { manifesto_id } = req.params;
    const { main_agenda, agenda_items, pdf_url } = req.body;

    if (!manifesto_id) {
        res.status(400);
        throw new Error('Manifesto ID is required');
    }

    // Update fields
    await db.query(
        `UPDATE manifestos
         SET main_agenda = ?, agenda_items = ?, pdf_url = ?
         WHERE manifesto_id = ?`,
        [main_agenda, JSON.stringify(agenda_items), pdf_url, manifesto_id]
    );

    Logger.info(`Manifesto updated: ${manifesto_id}`);
    res.status(200).json({ message: 'Manifesto updated successfully' });
});

module.exports = {
    createManifesto,
    editManifesto,
};
