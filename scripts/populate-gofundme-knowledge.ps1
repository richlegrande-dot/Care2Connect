# Populate GoFundMe Knowledge into Vault
# Adds comprehensive GoFundMe process documentation to knowledge vault

param(
    [string]$AdminPassword = "admin2024",
    [string]$BackendUrl = "http://localhost:3001"
)

Write-Host "`n=== Populating GoFundMe Knowledge Vault ===`n" -ForegroundColor Cyan

$headers = @{
    'x-admin-password' = $AdminPassword
    'Content-Type' = 'application/json'
}

# GoFundMe Step-by-Step Process from Documentation
# NOTE: User mentioned screenshots in chat - these are placeholders for the actual steps
$gofundmeSteps = @(
    @{
        step = 1
        title = "Start Your Fundraiser"
        process = @"
1. Go to GoFundMe.com
2. Click 'Start a GoFundMe' button (top right corner)
3. Choose your fundraising category from the list

Categories: Medical, Emergency, Memorial, Education, Family, Community, Business, Other

CareConnect Assistance: Category is already determined in your draft.
"@
        tags = @("GOFUNDME", "PROCESS", "ACCOUNT_SETUP", "STEP_1")
    },
    @{
        step = 2
        title = "Set Your Goal"
        process = @"
1. Enter your fundraising goal amount (in USD or your currency)
2. Click 'Continue'

CareConnect Assistance: Goal Amount is in your draft.
Copy the amount exactly into GoFundMe.

Tips:
- Be realistic but don't underestimate your needs
- You can adjust your goal later
- Consider adding 10-15% buffer for fees
"@
        tags = @("GOFUNDME", "PROCESS", "GOAL_SETTING", "STEP_2")
    },
    @{
        step = 3
        title = "Create or Sign In to Your Account"
        process = @"
If you have a GoFundMe account:
1. Click 'Sign In'
2. Enter your email and password

If you're new to GoFundMe:
1. Click 'Sign Up'
2. Provide: Full name, Email address, Password, Phone number
3. Verify your email address (check inbox for verification link)

Tips:
- Use an email you check regularly
- Choose a strong password
- Phone verification helps prevent fraud
"@
        tags = @("GOFUNDME", "PROCESS", "ACCOUNT_CREATION", "STEP_3")
    },
    @{
        step = 4
        title = "Add Cover Media"
        process = @"
1. Click 'Add Photo' or 'Add Video'
2. Upload from your device
3. Crop/position as needed
4. Click 'Save'

CareConnect Note: Photos and videos must be uploaded manually.
CareConnect does not provide cover media.

Best Practices:
- Use high-quality, well-lit photos
- Show faces when appropriate
- Avoid copyrighted images
- Video should be 30-90 seconds
"@
        tags = @("GOFUNDME", "PROCESS", "MEDIA_UPLOAD", "STEP_4")
    },
    @{
        step = 5
        title = "Tell Your Story"
        process = @"
1. Copy your story from CareConnect draft
2. Paste into the 'Story' text box
3. Review formatting
4. Add any additional details
5. Click 'Continue'

CareConnect Assistance: Your campaign story is fully drafted.
Use the 'Copy Story' button in your draft.

Story Best Practices:
- Start with the most important information
- Be honest and specific
- Include how funds will be used
- Keep paragraphs short (2-3 sentences)
"@
        tags = @("GOFUNDME", "PROCESS", "STORY_WRITING", "STEP_5", "DONATION_DRAFT")
    },
    @{
        step = 6
        title = "Add Location and Beneficiary"
        process = @"
Location:
1. Enter your city/zip code
2. GoFundMe will auto-complete
3. Select the correct location

Beneficiary (Who will receive funds):
1. Choose: 'Yourself' or 'Someone else'
2. If someone else, enter their name and email
3. They will receive notification

CareConnect Assistance: Location is in your draft.
"@
        tags = @("GOFUNDME", "PROCESS", "LOCATION_BENEFICIARY", "STEP_6")
    },
    @{
        step = 7
        title = "Review and Publish"
        process = @"
1. Review all campaign details:
   - Title
   - Goal
   - Category
   - Story
   - Location
   - Photos/Videos
2. Make any final edits
3. Check 'I agree to GoFundMe Terms'
4. Click 'Launch Fundraiser'

Your campaign is now LIVE and visible to potential donors.
"@
        tags = @("GOFUNDME", "PROCESS", "PUBLISHING", "STEP_7")
    },
    @{
        step = 8
        title = "Connect Your Bank Account"
        process = @"
1. Go to 'Settings' in your campaign dashboard
2. Click 'Bank Account'
3. Choose: Bank Account or Debit Card
4. Enter account details:
   - Account holder name
   - Routing number (9 digits)
   - Account number
5. Verify identity (may require photo ID)
6. Submit for verification (1-2 business days)

REQUIRED: You must connect a bank account to receive funds.
GoFundMe verifies accounts for security.
"@
        tags = @("GOFUNDME", "PROCESS", "BANK_SETUP", "STEP_8")
    },
    @{
        step = 9
        title = "Share Your Campaign"
        process = @"
1. Copy your campaign link
2. Share on social media (Facebook, Twitter, Instagram)
3. Send via email to friends/family
4. Post in community groups
5. Use QR code for in-person sharing

CareConnect Integration:
- QR code is generated automatically
- Links to your Stripe donation page
- Tracks donations from QR code separately

Sharing Tips:
- Post updates regularly
- Thank donors publicly
- Share campaign at least 3 times per platform
"@
        tags = @("GOFUNDME", "PROCESS", "SHARING", "STEP_9")
    },
    @{
        step = 10
        title = "Maintain Your Campaign"
        process = @"
1. Post updates every 3-7 days
2. Thank donors individually
3. Share milestones (25%, 50%, 75%, 100%)
4. Respond to comments/questions
5. Keep supporters engaged

Update Ideas:
- Progress photos
- How funds are being used
- Setbacks and challenges
- Success stories
- Final thank you when goal is reached
"@
        tags = @("GOFUNDME", "PROCESS", "MAINTENANCE", "STEP_10")
    }
)

# Draft generation template
$draftTemplate = @"
GOFUNDME CAMPAIGN DRAFT TEMPLATE

This template guides the AI in generating high-quality GoFundMe campaign drafts from user transcripts.

REQUIRED FIELDS:
1. Campaign Title (50-60 characters)
   - Format: "Help [Name] with [Primary Need]"
   - Example: "Help Sarah with Medical Expenses"
   
2. Fundraising Goal ($)
   - Extract from transcript or default to reasonable amount
   - Medical: $5,000-$50,000
   - Housing: $2,000-$10,000
   - Emergency: $1,000-$5,000
   
3. Category
   - Medical (health, treatment, surgery, disability)
   - Emergency (crisis, urgent need, disaster)
   - Memorial (funeral, memorial)
   - Education (tuition, books, supplies)
   - Family (childcare, family support)
   - Community (local projects, charity)
   - Business (startup, expansion)
   
4. Campaign Story (500-1000 words)
   Structure:
   - Opening (2-3 sentences): Who you are, what happened
   - Background (1-2 paragraphs): Context, how situation developed
   - Current Situation (1-2 paragraphs): Where things stand now
   - How Funds Help (1 paragraph): Specific breakdown of expenses
   - Closing (2-3 sentences): Thank you, impact of support
   
5. Short Summary (150-200 characters)
   - One sentence capture of the story
   - Use in social media shares

QUALITY CHECKS:
- Story is personal and honest
- Specific details about fund usage
- No excessive caps or exclamation marks
- Proper grammar and spelling
- Emotionally engaging but not manipulative
- Includes location context
- Clear call to action

EXTRACTION RULES:
- If name not mentioned, use "a community member"
- If location not mentioned, use generic "local area"
- If amount not mentioned, use category defaults
- If category unclear, default to "Emergency"

ERROR HANDLING:
- Missing critical info: Flag for manual review
- Vague story: Request more details from user
- Inappropriate content: Reject with explanation
- Insufficient length: Generate longer story with assumptions
"@

try {
    Write-Host "Creating knowledge sources...`n" -ForegroundColor Yellow
    
    # 1. Create main GoFundMe guide source
    $guideSource = @{
        title = "GoFundMe Campaign Creation Complete Guide"
        description = "Comprehensive step-by-step guide for creating GoFundMe campaigns from CareConnect drafts"
        sourceType = "DOC"
        metadata = @{
            version = "1.0"
            lastReviewed = (Get-Date -Format "yyyy-MM-dd")
            source = "internal"
            official_resource = "https://support.gofundme.com/hc/en-us/articles/360001992627"
        }
    } | ConvertTo-Json -Depth 5
    
    $guide = Invoke-RestMethod -Uri "$BackendUrl/admin/knowledge/sources" -Method POST -Headers $headers -Body $guideSource
    Write-Host "[+] Created: $($guide.title) (ID: $($guide.id))" -ForegroundColor Green
    
    # Add step chunks
    Write-Host "    Adding step-by-step chunks..." -ForegroundColor Gray
    foreach ($stepData in $gofundmeSteps) {
        $chunkBody = @{
            chunkText = "STEP $($stepData.step): $($stepData.title)`n`n$($stepData.process)"
            tags = $stepData.tags
            language = "en"
            metadata = @{
                stepNumber = $stepData.step
                stepTitle = $stepData.title
            }
        } | ConvertTo-Json -Depth 5
        
        try {
            Invoke-RestMethod -Uri "$BackendUrl/admin/knowledge/sources/$($guide.id)/chunks" -Method POST -Headers $headers -Body $chunkBody | Out-Null
            Write-Host "    [+] Step $($stepData.step): $($stepData.title)" -ForegroundColor Gray
        } catch {
            Write-Host "    [-] Failed: Step $($stepData.step)" -ForegroundColor Red
        }
    }
    
    # 2. Create draft template source (CRITICAL for getDonationDraftTemplate)
    Write-Host "`n[+] Creating draft generation template..." -ForegroundColor Yellow
    $templateSource = @{
        title = "GoFundMe Draft Generation Template"
        description = "AI template for generating GoFundMe campaign drafts from user stories"
        sourceType = "DOC"
        metadata = @{
            usage = "DONATION_PIPELINE"
            function = "getDonationDraftTemplate"
            critical = $true
        }
    } | ConvertTo-Json -Depth 5
    
    $template = Invoke-RestMethod -Uri "$BackendUrl/admin/knowledge/sources" -Method POST -Headers $headers -Body $templateSource
    Write-Host "[+] Created: $($template.title) (ID: $($template.id))" -ForegroundColor Green
    
    # Add template chunk with CRITICAL tags
    $templateChunk = @{
        chunkText = $draftTemplate
        tags = @("DONATION_DRAFT", "TEMPLATE", "GOFUNDME", "AI_GENERATION")
        language = "en"
        metadata = @{
            purpose = "Guide AI in generating high-quality GoFundMe drafts"
            used_by = "backend/src/services/donationPipeline/orchestrator.ts"
        }
    } | ConvertTo-Json -Depth 5
    
    Invoke-RestMethod -Uri "$BackendUrl/admin/knowledge/sources/$($template.id)/chunks" -Method POST -Headers $headers -Body $templateChunk | Out-Null
    Write-Host "    [+] Template chunk added" -ForegroundColor Gray
    
    # 3. Create troubleshooting source
    Write-Host "`n[+] Creating troubleshooting guide..." -ForegroundColor Yellow
    $troubleSource = @{
        title = "GoFundMe Draft Generation Troubleshooting"
        description = "Common errors and solutions for GoFundMe draft generation"
        sourceType = "DOC"
        metadata = @{
            usage = "ERROR_RECOVERY"
        }
    } | ConvertTo-Json -Depth 5
    
    $trouble = Invoke-RestMethod -Uri "$BackendUrl/admin/knowledge/sources" -Method POST -Headers $headers -Body $troubleSource
    Write-Host "[+] Created: $($trouble.title) (ID: $($trouble.id))" -ForegroundColor Green
    
    # Add troubleshooting chunks
    $errorScenarios = @(
        @{
            error = "Missing story content"
            solution = "Request user to record more details. Use template placeholder text with [MISSING] markers."
            tags = @("GOFUNDME", "TROUBLESHOOTING", "MISSING_DATA")
        },
        @{
            error = "Story too short (<200 words)"
            solution = "Generate longer story using category-specific templates. Add context about typical situations."
            tags = @("GOFUNDME", "TROUBLESHOOTING", "QUALITY_ISSUE")
        },
        @{
            error = "Unclear category"
            solution = "Analyze keywords: medical terms -> Medical, housing terms -> Family/Emergency, death -> Memorial"
            tags = @("GOFUNDME", "TROUBLESHOOTING", "CATEGORY_SELECTION")
        }
    )
    
    foreach ($scenario in $errorScenarios) {
        $errorChunk = @{
            chunkText = "ERROR: $($scenario.error)`n`nSOLUTION: $($scenario.solution)"
            tags = $scenario.tags
            language = "en"
        } | ConvertTo-Json -Depth 5
        
        Invoke-RestMethod -Uri "$BackendUrl/admin/knowledge/sources/$($trouble.id)/chunks" -Method POST -Headers $headers -Body $errorChunk | Out-Null
        Write-Host "    [+] Added: $($scenario.error)" -ForegroundColor Gray
    }
    
    Write-Host "`n=== Population Complete ===`n" -ForegroundColor Green
    Write-Host "Summary:" -ForegroundColor Cyan
    Write-Host "  [+] 3 knowledge sources created" -ForegroundColor Green
    Write-Host "  [+] $($gofundmeSteps.Count) step-by-step chunks" -ForegroundColor Green
    Write-Host "  [+] 1 draft template (DONATION_DRAFT + TEMPLATE tags)" -ForegroundColor Green
    Write-Host "  [+] $($errorScenarios.Count) troubleshooting scenarios" -ForegroundColor Green
    Write-Host "`nVerify:" -ForegroundColor Cyan
    Write-Host "  Run: .\scripts\audit-gofundme-knowledge.ps1" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Gray
    exit 1
}
