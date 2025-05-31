// app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getEntries } from '@/lib/db';
import { auth } from '@/app/auth';

export const GET = auth(async function GET(req) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;

    // Extract and deduplicate parameters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const boxTypes = [...new Set(searchParams.getAll('boxTypes'))];
    const selectedCompanyNames = [...new Set(searchParams.getAll('companies'))];
    const includeSummary = searchParams.get('includeSummary') === 'on' || searchParams.get('includeSummary') === 'true';

    // Validate parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: 'Start date and end date are required' },
        { status: 400 }
      );
    }
    if (boxTypes.length === 0) {
      return NextResponse.json(
        { message: 'At least one box type must be selected' },
        { status: 400 }
      );
    }

    // --- 1. Fetch Entries from Database ---
    // Get all entries (with a high limit to ensure we get all relevant ones)
    const allEntries = await getEntries(10000); // Adjust limit as needed
    
    // Filter entries by date range and other parameters
    const filteredEntries = allEntries.filter(entry => {
      const entryDate = new Date(entry.entry_date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Check date range
      if (entryDate < start || entryDate > end) return false;
      
      // Check company filter if companies are selected
      if (selectedCompanyNames.length > 0 && !selectedCompanyNames.includes(entry.company)) {
        return false;
      }
      
      return true;
    });

    // Format entries for the report
    const reportEntries = filteredEntries.map(entry => ({
      id: entry.id,
      entry_date: entry.entry_date instanceof Date 
        ? entry.entry_date.toISOString().split('T')[0] 
        : String(entry.entry_date),
      company: entry.company,
      E1in: Number(entry.e1in || 0),
      E1out: Number(entry.e1out || 0),
      E2in: Number(entry.e2in || 0),
      E2out: Number(entry.e2out || 0),
      photo_url: entry.photo_url,
      is_starting_balance: entry.is_starting_balance,
    }));

    // --- 2. Calculate Summary ---
    let reportSummary;
    if (includeSummary) {
      reportSummary = {
        totalE1in: 0,
        totalE1out: 0,
        totalE2in: 0,
        totalE2out: 0,
        byCompany: {},
      };

      reportEntries.forEach(entry => {
        if (boxTypes.includes('E1')) {
          reportSummary!.totalE1in += entry.E1in;
          reportSummary!.totalE1out += entry.E1out;
        }
        if (boxTypes.includes('E2')) {
          reportSummary!.totalE2in += entry.E2in;
          reportSummary!.totalE2out += entry.E2out;
        }

        if (!reportSummary!.byCompany[entry.company]) {
          reportSummary!.byCompany[entry.company] = { 
            E1in: 0, E1out: 0, E2in: 0, E2out: 0 
          };
        }
        
        const companySummary = reportSummary!.byCompany[entry.company];
        if (boxTypes.includes('E1')) {
          companySummary.E1in += entry.E1in;
          companySummary.E1out += entry.E1out;
        }
        if (boxTypes.includes('E2')) {
          companySummary.E2in += entry.E2in;
          companySummary.E2out += entry.E2out;
        }
      });
    }

    // --- 3. Construct Response ---
    const allCompanies = await sql`SELECT name from companies ORDER BY name`;
    const responseData = {
      parameters: {
        startDate,
        endDate,
        boxTypes,
        companies: selectedCompanyNames.length > 0 
          ? selectedCompanyNames 
          : allCompanies.map((c: any) => c.name),
        includeSummary,
      },
      entries: reportEntries,
      summary: reportSummary,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
});