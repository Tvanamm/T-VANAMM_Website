
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle } from 'lucide-react';

const FixedMigrationRunner = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const runMigration = async () => {
    setIsRunning(true);
    
    try {
      // First drop the existing function
      const dropQuery = `DROP FUNCTION IF EXISTS public.export_forms_data(date, date, text);`;
      
      const { error: dropError } = await supabase.rpc('execute_sql', {
        query: dropQuery
      });
      
      if (dropError) {
        console.log('Drop function note:', dropError.message);
        // Continue even if drop fails - function might not exist
      }

      // Now create the new function with correct return type
      const createQuery = `
CREATE OR REPLACE FUNCTION public.export_forms_data(start_date date DEFAULT NULL::date, end_date date DEFAULT NULL::date, form_type_filter text DEFAULT NULL::text)
 RETURNS TABLE(
   submission_id uuid, 
   submission_type text, 
   submitter_name text, 
   submitter_email text, 
   submitter_phone text, 
   submission_message text, 
   submission_status text, 
   submission_franchise_location text, 
   submission_investment_amount numeric, 
   submission_catalog_requested boolean, 
   submission_created_at timestamp with time zone, 
   contact_notes text, 
   contacted_at timestamp with time zone
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if current user is owner
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner') THEN
    RAISE EXCEPTION 'Access denied. Only owners can export forms data.';
  END IF;
  
  -- Set default date range if not provided (last 30 days)
  IF start_date IS NULL THEN
    start_date := CURRENT_DATE - INTERVAL '30 days';
  END IF;
  
  IF end_date IS NULL THEN
    end_date := CURRENT_DATE;
  END IF;
  
  -- Ensure date range doesn't exceed 30 days
  IF end_date - start_date > 30 THEN
    RAISE EXCEPTION 'Date range cannot exceed 30 days';
  END IF;
  
  RETURN QUERY
  SELECT 
    fs.id as submission_id,
    fs.type as submission_type,
    fs.name as submitter_name,
    fs.email as submitter_email,
    fs.phone as submitter_phone,
    fs.message as submission_message,
    fs.status as submission_status,
    fs.franchise_location as submission_franchise_location,
    fs.investment_amount as submission_investment_amount,
    fs.catalog_requested as submission_catalog_requested,
    fs.created_at as submission_created_at,
    fs.contact_notes,
    fs.contacted_at
  FROM public.form_submissions fs
  WHERE fs.created_at::date BETWEEN start_date AND end_date
    AND (form_type_filter IS NULL OR fs.type = form_type_filter)
    AND fs.status != 'archived'
  ORDER BY fs.created_at DESC;
END;
$function$;`;

      const { error: createError } = await supabase.rpc('execute_sql', {
        query: createQuery
      });

      if (createError) throw createError;

      setCompleted(true);
      toast({
        title: "Migration Completed Successfully! ✅",
        description: "Export function has been fixed and is ready to use.",
      });

    } catch (error: any) {
      console.error('Migration error:', error);
      toast({
        title: "Migration Failed",
        description: error.message || "Failed to run migration",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  if (completed) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800 font-medium">Migration completed successfully!</p>
        </div>
        <p className="text-sm text-green-700 mt-2">
          The export function has been fixed and all issues should now be resolved.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-5 w-5 text-yellow-600" />
        <p className="text-yellow-800 font-medium">Migration Required</p>
      </div>
      <p className="text-sm text-yellow-700 mb-4">
        The export function needs to be recreated to fix the column ambiguity issue.
      </p>
      <Button 
        onClick={runMigration}
        disabled={isRunning}
        className="bg-yellow-600 hover:bg-yellow-700"
      >
        {isRunning ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Running Migration...
          </>
        ) : (
          'Run Migration Fix'
        )}
      </Button>
    </div>
  );
};

export default FixedMigrationRunner;
