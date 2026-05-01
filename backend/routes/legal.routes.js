const express = require('express');
const router = express.Router();

// Import your actual controller
const legalController = require('../controllers/legal.controller');

const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const permit = require('../middlewares/permission.middleware');
const { validate } = require('../middlewares/validation.middleware');
const accessGuard = require('../middlewares/accessGuard');
const { body } = require('express-validator');

router.get('/:caseId',
    auth,
    role('LAWYER', 'OFFICER', 'ADMIN'),
    legalController.getRecord
)

router.post(
    '/add-comment',
    auth,
    role('LAWYER', 'ADMIN'),
    permit('ADD_LEGAL_COMMENT'),
    accessGuard('LEGAL_RECORDS'),
    legalController.postComment
);

router.post(
    '/schedule-hearing',
    auth,
    role('ADMIN'),
    legalController.addHearing
)

module.exports = router