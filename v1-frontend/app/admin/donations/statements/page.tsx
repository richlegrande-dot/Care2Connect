'use client'

import { useState, useEffect } from 'react'

interface DonationStatement {
  donorName: string
  donorEmail: string
  donations: Array<{
    date: string
    amount: number
    clientProfile: string
    donationId: string
  }>
  totalAmount: number
  dateRange: {
    start: string
    end: string
  }
}

export default function DonationStatementsPage() {
  const [donors, setDonors] = useState<string[]>([])
  const [selectedDonor, setSelectedDonor] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [statement, setStatement] = useState<DonationStatement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    loadDonors()
  }, [])

  const loadDonors = async () => {
    try {
      const response = await fetch('/api/admin/donations/ledger')
      if (response.ok) {
        const data = await response.json()
        const uniqueDonors = [...new Set(
          data.ledgerEntries
            .filter((entry: any) => entry.donorEmail && entry.donorEmail !== 'Not provided')
            .map((entry: any) => entry.donorEmail)
        )]
        setDonors(uniqueDonors.sort())
      }
    } catch (error) {
      console.error('Failed to load donors:', error)
    }
  }

  const generateStatement = async () => {
    if (!selectedDonor) {
      alert('Please select a donor')
      return
    }

    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('donorEmail', selectedDonor)
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)

      const response = await fetch(`/api/admin/donations/statement?${params}`)
      if (response.ok) {
        const data = await response.json()
        setStatement(data)
      } else {
        console.error('Failed to generate statement')
      }
    } catch (error) {
      console.error('Statement generation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generatePDF = async () => {
    if (!statement) return

    setIsGeneratingPDF(true)
    try {
      const params = new URLSearchParams()
      params.append('donorEmail', selectedDonor)
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)
      params.append('format', 'pdf')

      const response = await fetch(`/api/admin/donations/statement?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `annual_donation_statement_${selectedDonor.replace('@', '_at_')}_${new Date().getFullYear()}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('PDF generation error:', error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const printStatement = () => {
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Donor Statements
        </h1>
        <p className="text-gray-600">
          Generate itemized annual donation summaries for individual donors.
        </p>
      </div>

      {/* Statement Generator */}
      <div className="card mb-8 no-print">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Generate Statement</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Donor
            </label>
            <select
              value={selectedDonor}
              onChange={(e) => setSelectedDonor(e.target.value)}
              className="form-input"
            >
              <option value="">Choose donor...</option>
              {donors.map((donor) => (
                <option key={donor} value={donor}>
                  {donor}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date (Optional)
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="form-input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="form-input"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={generateStatement}
            disabled={isLoading || !selectedDonor}
            className="btn-primary"
          >
            {isLoading ? 'Generating...' : 'Generate Statement'}
          </button>
        </div>
      </div>

      {/* Statement Display */}
      {statement && (
        <>
          {/* Print/Export Actions */}
          <div className="flex space-x-2 mb-6 no-print">
            <button
              onClick={printStatement}
              className="btn-secondary"
            >
              🖨️ Print Statement
            </button>
            <button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="btn-secondary"
            >
              {isGeneratingPDF ? 'Generating PDF...' : '📥 Download PDF'}
            </button>
          </div>

          {/* Printable Statement */}
          <div className="bg-white p-8 border shadow-lg print:shadow-none print:border-none" id="statement">
            {/* Header */}
            <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Annual Donation Statement
              </h1>
              <div className="text-sm text-gray-600">
                <div><strong>{process.env.NEXT_PUBLIC_ORG_LEGAL_NAME || 'CareConnect Foundation'}</strong></div>
                <div>{process.env.NEXT_PUBLIC_ORG_ADDRESS || '123 Main St, City, ST ZIP'}</div>
                <div>EIN: {process.env.NEXT_PUBLIC_ORG_EIN || '00-0000000'}</div>
              </div>
            </div>

            {/* Donor Information */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Donor Information</h2>
              <div className="bg-gray-50 p-4 rounded">
                <div><strong>Name:</strong> {statement.donorName}</div>
                <div><strong>Email:</strong> {statement.donorEmail}</div>
                <div><strong>Statement Period:</strong> {
                  statement.dateRange.start && statement.dateRange.end 
                    ? `${new Date(statement.dateRange.start).toLocaleDateString()} - ${new Date(statement.dateRange.end).toLocaleDateString()}`
                    : 'All available records'
                }</div>
              </div>
            </div>

            {/* Donations Table */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Itemized Donations</h2>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Beneficiary</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {statement.donations.map((donation, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(donation.date).toLocaleDateString('en-US')}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Support for {donation.clientProfile}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                        ${donation.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold">
                    <td className="border border-gray-300 px-4 py-2" colSpan={2}>
                      <strong>Total Donations</strong>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      <strong>${statement.totalAmount.toFixed(2)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* IRS Statement */}
            <div className="border-2 border-gray-800 p-6 mb-8 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax Information</h2>
              <p className="text-sm leading-relaxed">
                <strong>Important:</strong> No goods or services were provided in exchange for these contributions. 
                This statement is provided for your tax records in accordance with IRS Publication 1771. 
                Please consult your tax advisor regarding the deductibility of charitable contributions.
              </p>
              <div className="mt-4 text-xs text-gray-600">
                <div><strong>Organization EIN:</strong> {process.env.NEXT_PUBLIC_ORG_EIN || '00-0000000'}</div>
                <div><strong>Total Donations in Statement Period:</strong> ${statement.totalAmount.toFixed(2)}</div>
                <div><strong>Number of Donations:</strong> {statement.donations.length}</div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-6 border-t border-gray-300">
              <div className="mb-4">
                <div className="w-64 mx-auto border-b border-gray-800 mb-2"></div>
                <div className="text-sm text-gray-600">Authorized Representative</div>
              </div>
              <div className="text-xs text-gray-500">
                <div>CareConnect Donation System</div>
                <div>Statement generated on {new Date().toLocaleDateString('en-US')}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* No Statement Message */}
      {!statement && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📊</div>
          <p>Select a donor and click "Generate Statement" to create an itemized donation summary.</p>
        </div>
      )}

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          #statement {
            box-shadow: none !important;
            border: none !important;
            margin: 0;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  )
}