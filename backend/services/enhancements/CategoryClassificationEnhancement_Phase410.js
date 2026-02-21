/**
 * Phase 4.10: Conservative Category Classification Enhancement  
 * Target: 15 of 41 category_wrong cases (37% of bucket)
 * 
 * CONSERVATIVE approach after Phase 4.8 regression (93.33% → 20%)
 * Focus: High-confidence category corrections with minimal risk
 * 
 * Expected improvement: ~3% (15/500 cases)
 * Confidence level: MEDIUM-HIGH (conservative approach) 
 */

class CategoryClassificationEnhancement_Phase410 {
    constructor() {
        this.name = "Phase 4.10: Conservative Category Classification Enhancement";
        this.targetCases = 15;
        this.confidenceLevel = "MEDIUM-HIGH";
        console.log("✅ Phase 4.10 Category Enhancement loaded - targeting 15 cases with conservative approach");
    }

    shouldApply(callData, currentResult) {
        // Only apply high-confidence category corrections
        const text = (callData.transcript || '').toLowerCase();
        const currentCategory = currentResult.category;

        // Skip if already correctly categorized by existing logic
        if (this.isAlreadyCorrect(text, currentCategory)) {
            return false;
        }

        // Only apply to clear misclassifications
        return this.isClearMisclassification(text, currentCategory);
    }

    isAlreadyCorrect(text, category) {
        // Don't interfere with categories that are likely already correct
        const categoryKeywords = {
            'HOUSING': ['rent', 'housing', 'apartment', 'home'],
            'UTILITIES': ['electric', 'gas', 'water', 'utility', 'power'],
            'MEDICAL': ['medical', 'medicine', 'doctor', 'hospital', 'health'],
            'TRANSPORTATION': ['car', 'vehicle', 'transport', 'gas', 'repair'],
            'FOOD': ['food', 'grocery', 'groceries', 'meal'],
            'CHILDCARE': ['childcare', 'daycare', 'child care', 'babysit']
        };

        const keywords = categoryKeywords[category] || [];
        return keywords.some(keyword => text.includes(keyword));
    }

    isClearMisclassification(text, currentCategory) {
        // Only target obvious misclassifications with high confidence

        // OTHER → specific category (conservative picks)
        if (currentCategory === 'OTHER') {
            // Clear utility bills
            if ((text.includes('electric') || text.includes('power') || text.includes('utility')) &&
                (text.includes('bill') || text.includes('payment'))) {
                return true;
            }
            
            // Clear food/grocery needs
            if (text.includes('groceries') || text.includes('grocery') || 
                (text.includes('food') && !text.includes('dog food') && !text.includes('cat food'))) {
                return true;
            }

            // Clear childcare needs
            if (text.includes('childcare') || text.includes('child care') || text.includes('daycare')) {
                return true;
            }
        }

        // HOUSING → UTILITIES (common misclassification)
        if (currentCategory === 'HOUSING') {
            if ((text.includes('electric') || text.includes('gas') || text.includes('water') || text.includes('utility')) &&
                text.includes('bill')) {
                return true;
            }
        }

        // TRANSPORTATION → HOUSING (rent for parking, etc.)
        if (currentCategory === 'TRANSPORTATION') {
            if (text.includes('rent') && !text.includes('car') && !text.includes('vehicle')) {
                return true;
            }
        }

        return false;
    }

    apply(callData, currentResult) {
        const text = (callData.transcript || '').toLowerCase();
        const currentCategory = currentResult.category;

        // Conservative category corrections
        let newCategory = currentCategory;
        let reason = "";

        // OTHER → specific category corrections
        if (currentCategory === 'OTHER') {
            if ((text.includes('electric') || text.includes('power') || text.includes('utility')) &&
                (text.includes('bill') || text.includes('payment'))) {
                newCategory = 'UTILITIES';
                reason = "Utility bill pattern detected";
            } else if (text.includes('groceries') || text.includes('grocery') || 
                       (text.includes('food') && !text.includes('dog food') && !text.includes('cat food'))) {
                newCategory = 'FOOD';
                reason = "Food/grocery pattern detected";
            } else if (text.includes('childcare') || text.includes('child care') || text.includes('daycare')) {
                newCategory = 'CHILDCARE';
                reason = "Childcare pattern detected";
            }
        }

        // HOUSING → UTILITIES correction
        else if (currentCategory === 'HOUSING') {
            if ((text.includes('electric') || text.includes('gas') || text.includes('water') || text.includes('utility')) &&
                text.includes('bill')) {
                newCategory = 'UTILITIES';
                reason = "Utility bill misclassified as housing";
            }
        }

        // TRANSPORTATION → HOUSING correction
        else if (currentCategory === 'TRANSPORTATION') {
            if (text.includes('rent') && !text.includes('car') && !text.includes('vehicle')) {
                newCategory = 'HOUSING';
                reason = "Rent misclassified as transportation";
            }
        }

        // Apply correction if found
        if (newCategory !== currentCategory) {
            return {
                ...currentResult,
                category: newCategory,
                confidence: Math.max(0.75, currentResult.confidence - 0.05),
                processingNotes: [
                    ...(currentResult.processingNotes || []),
                    `📂 Phase 4.10 Category Correction: ${currentCategory} → ${newCategory} (${reason})`
                ]
            };
        }

        return currentResult;
    }

    getStats() {
        return {
            phase: "4.10",
            name: "Conservative Category Classification Enhancement",
            targetCases: 15,
            targetBucket: "category_wrong", 
            bucketSize: 41,
            expectedImprovement: "3.0%",
            confidenceLevel: "MEDIUM-HIGH",
            note: "Conservative approach after Phase 4.8 regression"
        };
    }
}

module.exports = CategoryClassificationEnhancement_Phase410;