import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../db.js';
import { DateTime } from 'luxon';
import { time } from 'console';


interface DateRange {
    startDate: Date;
    endDate: Date;
}

interface ReportData {
    totalJobs: number;
    totalCalls: number;
    jobsByMarketingTeam: { [key: string]: number };
    callsByMarketingTeam: { [key: string]: number };
    dateRange: {
        from: string;
        to: string;
    };
}

const defaultTimeZone = "America/New_York";

const parseDate = (dateString: string): Date => {
  const [yearStr = '', monthStr = '', dayStr = ''] = dateString.split("-");
  
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  const date = new Date(year, month - 1, day);
  
  // Validate the date is what we expect
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error('Invalid date');
  }

  return date;
};

const parseDateLuxon = (dateString: string, timeZone: string = defaultTimeZone, daysDiff: number = 0): Date => {
    const dt = DateTime.fromISO(dateString, { zone: timeZone }).minus({ days: daysDiff });   
    if (!dt.isValid) {
        throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }   
    return dt.toJSDate();
}


// Helper function to get date range based on duration
const getDateRange = (
    duration: string,
    customFrom: string | null = null,
    customTo: string | null = null,
    timeZone: string = defaultTimeZone
): DateRange => {
    const now = new Date();
    let startDate: Date, endDate: Date;

    switch (duration) {
        case 'today':
            startDate = parseDateLuxon(DateTime.now().toISODate(), timeZone);
            endDate = parseDateLuxon(DateTime.now().toISODate(), timeZone);
            break;

        case 'week':
            const startOfWeek = parseDateLuxon(DateTime.now().toISODate(), timeZone, 6);
            const endOfWeek = parseDateLuxon(DateTime.now().toISODate(), timeZone);

            startDate = startOfWeek;
            endDate = endOfWeek;
            break;

        case 'month':
            startDate = parseDateLuxon(DateTime.now().toISODate(), timeZone, 29);
            endDate = parseDateLuxon(DateTime.now().toISODate(), timeZone);
            break;

        case 'custom':
            if (!customFrom || !customTo) {
                throw new Error('Custom date range requires both from and to dates');
            }
            
            startDate = parseDateLuxon(customFrom, timeZone);
            endDate = parseDateLuxon(customTo, timeZone);
            // endDate.setHours(23, 59, 59, 999);
            break;

        default:
            throw new Error('Invalid duration specified');
    }

    return { startDate, endDate };
};

export async function getReport(req: Request, res: Response) {
    console.log('Generating report...', req.query);
    try {
        const { duration, fromDate, toDate, timeZone } = req.query;
        const userId = new ObjectId(req.user!.id);

        if (!duration) {
            res.status(400).json({ message: 'Duration is required' });
            return;
        }

        if (!['today', 'week', 'month', 'custom'].includes(duration as string)) {
            res.status(400).json({ message: 'Invalid duration. Must be: today, week, month, or custom' });
            return;
        }

        const { startDate, endDate } = getDateRange(
            duration as string,
            fromDate as string || null,
            toDate as string || null,
            timeZone as string || defaultTimeZone
        );

        // Build query filters for calls
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        console.log(`Date range: ${startDateStr} to ${endDateStr}`);
        const db = getDb();

        // Use the database service

        const jobsCollection = db.collection('job');
        const callsCollection = db.collection('call');

        // Build query filters for jobs
        const jobFilter = {
            dateSubmitted: {
                $gte: startDateStr,
                $lte: endDateStr
            }
        };

        

        const callFilter = {
            date: {
                $gte: startDateStr,
                $lte: endDateStr
            }
        };

        // Execute parallel queries
        const [jobs, calls] = await Promise.all([
            jobsCollection.find(jobFilter).toArray(),
            callsCollection.find(callFilter).toArray()
        ]);

        //   return { jobs, calls };
        // });

        // const { jobs, calls } = result;
        const totalJobs = jobs.length;
        const totalCalls = calls.length;

        // Group jobs by marketing team
        const jobsByMarketingTeam: { [key: string]: number } = jobs.reduce((acc, job) => {
            const team = job.marketingTeam || 'Not Specified';
            acc[team] = (acc[team] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        // Group calls by marketing team
        const callsByMarketingTeam: { [key: string]: number } = calls.reduce((acc, call) => {
            const team = call.marketingTeam || 'Not Specified';
            acc[team] = (acc[team] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        const reportData: ReportData = {
            totalJobs,
            totalCalls,
            jobsByMarketingTeam,
            callsByMarketingTeam,
            dateRange: {
                from: startDate.toISOString(),
                to: endDate.toISOString()
            }
        };

        res.json(reportData);
    } catch (error: any) {
        console.error('Error generating report:', error);
        res.status(500).json({
            message: error.message || 'Server error generating report'
        });
    }
}