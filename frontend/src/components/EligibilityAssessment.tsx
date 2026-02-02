import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, Info, ExternalLink, FileText, Calculator } from 'lucide-react';

interface EligibilityFormData {
  // Demographics
  age?: number;
  householdSize: number;
  hasChildren: boolean;
  isPregnant: boolean;
  isElderly: boolean;
  hasDisability: boolean;
  isVeteran: boolean;
  
  // Income and assets
  monthlyIncome: number;
  hasAssets: boolean;
  assetValue?: number;
  employmentStatus: string;
  
  // Housing situation
  housingStatus: string;
  hasUtilitiesShutoff: boolean;
  rentAmount?: number;
  
  // Location
  state: string;
  county?: string;
  zipCode?: string;
  
  // Special circumstances
  domesticViolenceSurvivor: boolean;
  hasSubstanceAbuseHistory: boolean;
  hasCriminalHistory: boolean;
  hasEducationNeeds: boolean;
  
  // Current assistance
  receivingFoodStamps: boolean;
  receivingMedicaid: boolean;
  receivingTANF: boolean;
  receivingHousing: boolean;
  
  // Consent and preferences
  consentToAssessment: boolean;
  wantsAIGuidance: boolean;
  preferredContactMethod?: string;
}

interface EligibilityResult {
  overallScore: number;
  likelyEligiblePrograms: string[];
  requiresMoreInfo: string[];
  notEligiblePrograms: string[];
  reasoning: { [key: string]: string };
  nextSteps: string[];
  estimatedBenefitAmount?: { [key: string]: string };
  requiredDocuments: string[];
  applicationDeadlines: { [key: string]: string };
  aiGuidance?: {
    summary: string;
    personalizedRecommendations: string[];
    urgentActions: string[];
    localResources: Array<{
      name: string;
      description: string;
      phone?: string;
      website?: string;
      address?: string;
    }>;
    documentationTips: string[];
    timelineGuidance: string;
  };
}

interface AidProgram {
  id: string;
  name: string;
  description: string;
  category: string;
  eligibilityRequirements: string[];
  benefitType: string;
  averageBenefit: string;
  applicationProcess: string;
  website?: string;
  phone?: string;
  isEmergency: boolean;
}

export default function EligibilityAssessment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EligibilityFormData>({
    householdSize: 1,
    hasChildren: false,
    isPregnant: false,
    isElderly: false,
    hasDisability: false,
    isVeteran: false,
    monthlyIncome: 0,
    hasAssets: false,
    employmentStatus: '',
    housingStatus: '',
    hasUtilitiesShutoff: false,
    state: '',
    domesticViolenceSurvivor: false,
    hasSubstanceAbuseHistory: false,
    hasCriminalHistory: false,
    hasEducationNeeds: false,
    receivingFoodStamps: false,
    receivingMedicaid: false,
    receivingTANF: false,
    receivingHousing: false,
    consentToAssessment: false,
    wantsAIGuidance: false
  });
  
  const [loading, setLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<EligibilityResult | null>(null);
  const [availablePrograms, setAvailablePrograms] = useState<AidProgram[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const totalSteps = 6;
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  // Load available programs on component mount
  useEffect(() => {
    loadAvailablePrograms();
  }, []);

  const loadAvailablePrograms = async () => {
    try {
      const response = await fetch('/api/eligibility/programs');
      if (response.ok) {
        const data = await response.json();
        setAvailablePrograms(data.programs || []);
      }
    } catch (error) {
      console.error('Failed to load programs:', error);
    }
  };

  const updateFormData = (field: keyof EligibilityFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (currentStep) {
      case 1: // Demographics
        if (!formData.householdSize || formData.householdSize < 1) {
          newErrors.householdSize = 'Household size is required';
        }
        break;
        
      case 2: // Income
        if (formData.monthlyIncome < 0) {
          newErrors.monthlyIncome = 'Income cannot be negative';
        }
        if (!formData.employmentStatus) {
          newErrors.employmentStatus = 'Employment status is required';
        }
        break;
        
      case 3: // Housing
        if (!formData.housingStatus) {
          newErrors.housingStatus = 'Housing status is required';
        }
        break;
        
      case 4: // Location
        if (!formData.state) {
          newErrors.state = 'State is required';
        }
        break;
        
      case 6: // Consent
        if (!formData.consentToAssessment) {
          newErrors.consentToAssessment = 'Consent is required to proceed with assessment';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitAssessment = async () => {
    if (!validateCurrentStep()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/eligibility/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAssessmentResult(data.assessment);
      } else {
        setErrors({ submit: data.error || 'Assessment failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tell us about your household</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Your Age (optional)</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => updateFormData('age', parseInt(e.target.value) || undefined)}
                    placeholder="Enter your age"
                  />
                </div>
                
                <div>
                  <Label htmlFor="householdSize">Household Size *</Label>
                  <Input
                    id="householdSize"
                    type="number"
                    min="1"
                    value={formData.householdSize}
                    onChange={(e) => updateFormData('householdSize', parseInt(e.target.value) || 1)}
                    className={errors.householdSize ? 'border-red-500' : ''}
                  />
                  {errors.householdSize && (
                    <p className="text-red-500 text-sm mt-1">{errors.householdSize}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Special Circumstances</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasChildren"
                    checked={formData.hasChildren}
                    onCheckedChange={(checked) => updateFormData('hasChildren', checked)}
                  />
                  <Label htmlFor="hasChildren">Have children under 18</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPregnant"
                    checked={formData.isPregnant}
                    onCheckedChange={(checked) => updateFormData('isPregnant', checked)}
                  />
                  <Label htmlFor="isPregnant">Currently pregnant</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isElderly"
                    checked={formData.isElderly}
                    onCheckedChange={(checked) => updateFormData('isElderly', checked)}
                  />
                  <Label htmlFor="isElderly">Age 60 or older</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasDisability"
                    checked={formData.hasDisability}
                    onCheckedChange={(checked) => updateFormData('hasDisability', checked)}
                  />
                  <Label htmlFor="hasDisability">Have a disability</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isVeteran"
                    checked={formData.isVeteran}
                    onCheckedChange={(checked) => updateFormData('isVeteran', checked)}
                  />
                  <Label htmlFor="isVeteran">Military veteran</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Income and Employment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthlyIncome">Monthly Household Income *</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyIncome}
                  onChange={(e) => updateFormData('monthlyIncome', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={errors.monthlyIncome ? 'border-red-500' : ''}
                />
                {errors.monthlyIncome && (
                  <p className="text-red-500 text-sm mt-1">{errors.monthlyIncome}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  Include all income sources (jobs, benefits, support, etc.)
                </p>
              </div>
              
              <div>
                <Label htmlFor="employmentStatus">Employment Status *</Label>
                <Select value={formData.employmentStatus} onValueChange={(value) => updateFormData('employmentStatus', value)}>
                  <SelectTrigger className={errors.employmentStatus ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employed_full_time">Employed Full-Time</SelectItem>
                    <SelectItem value="employed_part_time">Employed Part-Time</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                    <SelectItem value="disabled">Unable to Work (Disabled)</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="homemaker">Homemaker/Caregiver</SelectItem>
                    <SelectItem value="self_employed">Self-Employed</SelectItem>
                  </SelectContent>
                </Select>
                {errors.employmentStatus && (
                  <p className="text-red-500 text-sm mt-1">{errors.employmentStatus}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasAssets"
                  checked={formData.hasAssets}
                  onCheckedChange={(checked) => updateFormData('hasAssets', checked)}
                />
                <Label htmlFor="hasAssets">Have significant assets (savings, property, investments)</Label>
              </div>
              
              {formData.hasAssets && (
                <div>
                  <Label htmlFor="assetValue">Approximate Asset Value</Label>
                  <Input
                    id="assetValue"
                    type="number"
                    min="0"
                    value={formData.assetValue || ''}
                    onChange={(e) => updateFormData('assetValue', parseFloat(e.target.value) || undefined)}
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Housing Situation</h3>
            
            <div>
              <Label htmlFor="housingStatus">Current Housing Status *</Label>
              <Select value={formData.housingStatus} onValueChange={(value) => updateFormData('housingStatus', value)}>
                <SelectTrigger className={errors.housingStatus ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select housing status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homeless">Homeless (shelter, street, car)</SelectItem>
                  <SelectItem value="at_risk">At risk of homelessness</SelectItem>
                  <SelectItem value="doubled_up">Staying with others temporarily</SelectItem>
                  <SelectItem value="renting">Renting apartment/house</SelectItem>
                  <SelectItem value="owns_home">Own home</SelectItem>
                  <SelectItem value="subsidized">Subsidized housing</SelectItem>
                  <SelectItem value="transitional">Transitional housing</SelectItem>
                </SelectContent>
              </Select>
              {errors.housingStatus && (
                <p className="text-red-500 text-sm mt-1">{errors.housingStatus}</p>
              )}
            </div>

            {(formData.housingStatus === 'renting' || formData.housingStatus === 'at_risk') && (
              <div>
                <Label htmlFor="rentAmount">Monthly Rent/Housing Costs</Label>
                <Input
                  id="rentAmount"
                  type="number"
                  min="0"
                  value={formData.rentAmount || ''}
                  onChange={(e) => updateFormData('rentAmount', parseFloat(e.target.value) || undefined)}
                  placeholder="0.00"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasUtilitiesShutoff"
                  checked={formData.hasUtilitiesShutoff}
                  onCheckedChange={(checked) => updateFormData('hasUtilitiesShutoff', checked)}
                />
                <Label htmlFor="hasUtilitiesShutoff">Have utilities shut off or at risk of shutoff</Label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Location Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(value) => updateFormData('state', value)}>
                  <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AL">Alabama</SelectItem>
                    <SelectItem value="AK">Alaska</SelectItem>
                    <SelectItem value="AZ">Arizona</SelectItem>
                    <SelectItem value="AR">Arkansas</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="CO">Colorado</SelectItem>
                    <SelectItem value="CT">Connecticut</SelectItem>
                    <SelectItem value="DE">Delaware</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="GA">Georgia</SelectItem>
                    {/* Add more states as needed */}
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="zipCode">ZIP Code (optional)</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode || ''}
                  onChange={(e) => updateFormData('zipCode', e.target.value)}
                  placeholder="Enter ZIP code"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Helps us find local resources and programs
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="county">County (optional)</Label>
              <Input
                id="county"
                value={formData.county || ''}
                onChange={(e) => updateFormData('county', e.target.value)}
                placeholder="Enter county name"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Special Circumstances</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="domesticViolenceSurvivor"
                      checked={formData.domesticViolenceSurvivor}
                      onCheckedChange={(checked) => updateFormData('domesticViolenceSurvivor', checked)}
                    />
                    <Label htmlFor="domesticViolenceSurvivor">Domestic violence survivor</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasSubstanceAbuseHistory"
                      checked={formData.hasSubstanceAbuseHistory}
                      onCheckedChange={(checked) => updateFormData('hasSubstanceAbuseHistory', checked)}
                    />
                    <Label htmlFor="hasSubstanceAbuseHistory">Substance abuse history</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasCriminalHistory"
                      checked={formData.hasCriminalHistory}
                      onCheckedChange={(checked) => updateFormData('hasCriminalHistory', checked)}
                    />
                    <Label htmlFor="hasCriminalHistory">Criminal history</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasEducationNeeds"
                      checked={formData.hasEducationNeeds}
                      onCheckedChange={(checked) => updateFormData('hasEducationNeeds', checked)}
                    />
                    <Label htmlFor="hasEducationNeeds">Need educational support (GED, ESL, etc.)</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Current Assistance</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Check any benefits you're currently receiving
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="receivingFoodStamps"
                      checked={formData.receivingFoodStamps}
                      onCheckedChange={(checked) => updateFormData('receivingFoodStamps', checked)}
                    />
                    <Label htmlFor="receivingFoodStamps">SNAP/Food Stamps</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="receivingMedicaid"
                      checked={formData.receivingMedicaid}
                      onCheckedChange={(checked) => updateFormData('receivingMedicaid', checked)}
                    />
                    <Label htmlFor="receivingMedicaid">Medicaid</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="receivingTANF"
                      checked={formData.receivingTANF}
                      onCheckedChange={(checked) => updateFormData('receivingTANF', checked)}
                    />
                    <Label htmlFor="receivingTANF">TANF/Cash Assistance</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="receivingHousing"
                      checked={formData.receivingHousing}
                      onCheckedChange={(checked) => updateFormData('receivingHousing', checked)}
                    />
                    <Label htmlFor="receivingHousing">Housing assistance</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Privacy & Consent</h3>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your information is kept confidential and is only used to assess program eligibility. 
                We do not store personal information or share it with third parties.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="consentToAssessment"
                  checked={formData.consentToAssessment}
                  onCheckedChange={(checked) => updateFormData('consentToAssessment', checked)}
                  className={errors.consentToAssessment ? 'border-red-500' : ''}
                />
                <div>
                  <Label htmlFor="consentToAssessment" className="text-sm">
                    I consent to this eligibility assessment and understand that:
                  </Label>
                  <ul className="text-xs text-gray-600 mt-1 ml-4 space-y-1">
                    <li>• This is for informational purposes only</li>
                    <li>• Results are not guarantees of eligibility</li>
                    <li>• I must apply directly to programs for official determination</li>
                    <li>• Information provided should be accurate to the best of my knowledge</li>
                  </ul>
                </div>
              </div>
              {errors.consentToAssessment && (
                <p className="text-red-500 text-sm">{errors.consentToAssessment}</p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="wantsAIGuidance"
                  checked={formData.wantsAIGuidance}
                  onCheckedChange={(checked) => updateFormData('wantsAIGuidance', checked)}
                />
                <div>
                  <Label htmlFor="wantsAIGuidance" className="text-sm">
                    Include AI-powered personalized guidance and recommendations
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Get customized advice, action plans, and local resource recommendations
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="preferredContactMethod">Preferred Contact Method (optional)</Label>
                <Select 
                  value={formData.preferredContactMethod || ''} 
                  onValueChange={(value) => updateFormData('preferredContactMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="text">Text Message</SelectItem>
                    <SelectItem value="mail">Physical Mail</SelectItem>
                    <SelectItem value="none">No contact preferred</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {errors.submit && (
              <Alert className="border-red-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Show results if assessment is complete
  if (assessmentResult) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Your Eligibility Assessment Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Overall Eligibility Score</h3>
              <span className="text-2xl font-bold text-blue-600">
                {assessmentResult.overallScore}%
              </span>
            </div>
            <Progress value={assessmentResult.overallScore} className="h-2" />
          </div>

          {/* Likely Eligible Programs */}
          {assessmentResult.likelyEligiblePrograms.length > 0 && (
            <div>
              <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Likely Eligible Programs ({assessmentResult.likelyEligiblePrograms.length})
              </h3>
              <div className="grid gap-3">
                {assessmentResult.likelyEligiblePrograms.map((programId) => {
                  const program = availablePrograms.find(p => p.id === programId);
                  return (
                    <Card key={programId} className="border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-green-700">{program?.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{program?.description}</p>
                            <div className="flex gap-2 mb-2">
                              <Badge variant="outline">{program?.category}</Badge>
                              <Badge variant="outline">{program?.benefitType}</Badge>
                              {program?.isEmergency && (
                                <Badge className="bg-red-100 text-red-700">Emergency</Badge>
                              )}
                            </div>
                            <p className="text-sm">
                              <strong>Average benefit:</strong> {program?.averageBenefit}
                            </p>
                            {assessmentResult.reasoning[programId] && (
                              <p className="text-sm text-gray-600 mt-1">
                                <strong>Why you qualify:</strong> {assessmentResult.reasoning[programId]}
                              </p>
                            )}
                          </div>
                          {program?.website && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={program.website} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Programs Requiring More Information */}
          {assessmentResult.requiresMoreInfo.length > 0 && (
            <div>
              <h3 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                <Info className="h-5 w-5" />
                May Be Eligible - More Info Needed ({assessmentResult.requiresMoreInfo.length})
              </h3>
              <div className="space-y-2">
                {assessmentResult.requiresMoreInfo.map((programId) => {
                  const program = availablePrograms.find(p => p.id === programId);
                  return (
                    <Card key={programId} className="border-orange-200">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{program?.name}</h4>
                            <p className="text-sm text-gray-600">{program?.description}</p>
                          </div>
                          <Badge variant="outline" className="text-orange-700">Needs Review</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Guidance Section */}
          {assessmentResult.aiGuidance && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-700 mb-3">🤖 AI-Powered Guidance</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Summary & Recommendations</h4>
                  <p className="text-sm text-gray-700 mb-3">{assessmentResult.aiGuidance.summary}</p>
                  
                  {assessmentResult.aiGuidance.personalizedRecommendations.length > 0 && (
                    <ul className="text-sm space-y-1">
                      {assessmentResult.aiGuidance.personalizedRecommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {assessmentResult.aiGuidance.urgentActions.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Urgent Actions Needed:</strong>
                      <ul className="mt-1 space-y-1">
                        {assessmentResult.aiGuidance.urgentActions.map((action, index) => (
                          <li key={index}>• {action}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Next Steps
            </h3>
            <ol className="space-y-2">
              {assessmentResult.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Required Documents */}
          {assessmentResult.requiredDocuments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">📋 Documents You'll Need</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {assessmentResult.requiredDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={() => {
              setCurrentStep(1);
              setAssessmentResult(null);
              setFormData({
                householdSize: 1,
                hasChildren: false,
                isPregnant: false,
                isElderly: false,
                hasDisability: false,
                isVeteran: false,
                monthlyIncome: 0,
                hasAssets: false,
                employmentStatus: '',
                housingStatus: '',
                hasUtilitiesShutoff: false,
                state: '',
                domesticViolenceSurvivor: false,
                hasSubstanceAbuseHistory: false,
                hasCriminalHistory: false,
                hasEducationNeeds: false,
                receivingFoodStamps: false,
                receivingMedicaid: false,
                receivingTANF: false,
                receivingHousing: false,
                consentToAssessment: false,
                wantsAIGuidance: false
              });
            }}>
              New Assessment
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              Print Results
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main assessment form
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          Aid Eligibility Assessment
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {renderStepContent()}
          
          <div className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep === totalSteps ? (
              <Button 
                onClick={submitAssessment}
                disabled={loading || !formData.consentToAssessment}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assessing...
                  </>
                ) : (
                  'Complete Assessment'
                )}
              </Button>
            ) : (
              <Button 
                onClick={nextStep}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}