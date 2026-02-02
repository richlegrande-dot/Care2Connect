import { Router } from 'express';
import { ResourceController } from '../controllers/resourceController';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

/**
 * GET /api/resources/search
 * Search for local resources
 */
router.get(
  '/search',
  [
    query('zipCode').optional().isString().withMessage('Zip code must be a string'),
    query('city').optional().isString().withMessage('City must be a string'),
    query('state').optional().isString().withMessage('State must be a string'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
    query('radius').optional().isInt({ min: 1, max: 100 }).withMessage('Radius must be 1-100 miles'),
  ],
  validateRequest,
  ResourceController.searchResources
);

/**
 * GET /api/resources/recommendations/:userId
 * Get personalized resource recommendations
 */
router.get(
  '/recommendations/:userId',
  [
    param('userId').isString().notEmpty().withMessage('User ID is required'),
  ],
  validateRequest,
  ResourceController.getResourceRecommendations
);

/**
 * GET /api/resources/categories
 * Get resource categories
 */
router.get(
  '/categories',
  ResourceController.getResourceCategories
);

/**
 * GET /api/resources/:resourceId
 * Get resource details by ID
 */
router.get(
  '/:resourceId',
  [
    param('resourceId').isString().notEmpty().withMessage('Resource ID is required'),
  ],
  validateRequest,
  ResourceController.getResourceDetails
);

/**
 * POST /api/resources
 * Add a new resource (admin/caseworker functionality)
 */
router.post(
  '/',
  [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('category').isString().notEmpty().withMessage('Category is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('address').optional().isString().withMessage('Address must be a string'),
    body('city').optional().isString().withMessage('City must be a string'),
    body('state').optional().isString().withMessage('State must be a string'),
    body('zipCode').optional().isString().withMessage('Zip code must be a string'),
    body('phone').optional().isString().withMessage('Phone must be a string'),
    body('email').optional().isEmail().withMessage('Email must be valid'),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('hours').optional().isObject().withMessage('Hours must be an object'),
    body('services').optional().isArray().withMessage('Services must be an array'),
    body('eligibility').optional().isString().withMessage('Eligibility must be a string'),
    body('verified').optional().isBoolean().withMessage('Verified must be boolean'),
  ],
  validateRequest,
  ResourceController.addResource
);

/**
 * PUT /api/resources/:resourceId
 * Update resource information (admin/caseworker functionality)
 */
router.put(
  '/:resourceId',
  [
    param('resourceId').isString().notEmpty().withMessage('Resource ID is required'),
    body('name').optional().isString().withMessage('Name must be a string'),
    body('category').optional().isString().withMessage('Category must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('address').optional().isString().withMessage('Address must be a string'),
    body('city').optional().isString().withMessage('City must be a string'),
    body('state').optional().isString().withMessage('State must be a string'),
    body('zipCode').optional().isString().withMessage('Zip code must be a string'),
    body('phone').optional().isString().withMessage('Phone must be a string'),
    body('email').optional().isEmail().withMessage('Email must be valid'),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('hours').optional().isObject().withMessage('Hours must be an object'),
    body('services').optional().isArray().withMessage('Services must be an array'),
    body('eligibility').optional().isString().withMessage('Eligibility must be a string'),
    body('verified').optional().isBoolean().withMessage('Verified must be boolean'),
  ],
  validateRequest,
  ResourceController.updateResource
);

/**
 * DELETE /api/resources/:resourceId
 * Delete a resource (admin functionality)
 */
router.delete(
  '/:resourceId',
  [
    param('resourceId').isString().notEmpty().withMessage('Resource ID is required'),
    body('confirmDelete').isBoolean().equals('true').withMessage('Confirmation required'),
  ],
  validateRequest,
  ResourceController.deleteResource
);

/**
 * POST /api/resources/search-by-needs
 * Search resources by urgent needs
 */
router.post(
  '/search-by-needs',
  [
    body('needs').isArray().notEmpty().withMessage('Needs array is required'),
    body('location').optional().isString().withMessage('Location must be a string'),
  ],
  validateRequest,
  ResourceController.searchByNeeds
);

export default router;