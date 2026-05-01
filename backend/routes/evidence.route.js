const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth.middleware')
const role = require('../middlewares/role.middleware')
const permit = require('../middlewares/permission.middleware')
const { validate } = require('../middlewares/validation.middleware')
const canAccessCase = require('../middlewares/accessGuard')
const EvidenceController = require('../controllers/evidence.controller')
const { evidenceSchema, witnessSchema } = require('../validators/evidence.validator')
const upload = require('../middlewares/multer.middleware')

router.use(auth)

router.get("/:id/evidence",
    role("CITIZEN","OFFICER", "JUDGE", "ADMIN"),
    permit("REPORT_CASE", "INVESTIGATE_CASE"),
    canAccessCase("GET_EVIDENCES"),
    EvidenceController.getEvidence
)

router.post("/:id/evidence",
    role("CITIZEN", "ADMIN","OFFICER"),
    permit("REPORT_CASE", "INVESTIGATE_CASE"),
    canAccessCase("EVIDENCE_UPLOAD"),
    validate(evidenceSchema),
    upload.single('file'),
    EvidenceController.addEvidence
),

// CREATE witness
router.post("/:id/witness",
    role("CITIZEN", "OFFICER", "ADMIN"),
    permit("REPORT_CASE", "INVESTIGATE_CASE"),
    canAccessCase("WITNESSES_EVIDENCE_UPLOAD"),
    validate(witnessSchema),
    EvidenceController.addWitness
)

// GET witnesses
router.get("/:id/witness",
    role("CITIZEN","OFFICER", "JUDGE", "ADMIN"),
    permit("INVESTIGATE_CASE"),
    canAccessCase("GET_WITNESSES_EVIDENCE"),
    EvidenceController.getWitness
)

// OFFICER
router.delete("/:caseId/evidence/:evidenceId",
    role("CITIZEN", "OFFICER", "ADMIN"),
    permit("REPORT_CASE", "INVESTIGATE_CASE"),
    EvidenceController.deleteEvidence
)

module.exports = router

