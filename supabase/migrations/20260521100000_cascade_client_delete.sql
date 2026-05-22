-- Drop and recreate the FK on vacancies.client_id with ON DELETE CASCADE
ALTER TABLE public.vacancies
  DROP CONSTRAINT IF EXISTS vacancies_client_id_fkey,
  ADD CONSTRAINT vacancies_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- Ensure applications.vacancy_id cascades
ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_vacancy_id_fkey,
  ADD CONSTRAINT applications_vacancy_id_fkey
    FOREIGN KEY (vacancy_id) REFERENCES public.vacancies(id) ON DELETE CASCADE;

-- Ensure interviews.vacancy_id cascades (interviews should be deleted when vacancy is deleted)
ALTER TABLE public.interviews
  DROP CONSTRAINT IF EXISTS interviews_vacancy_id_fkey,
  ADD CONSTRAINT interviews_vacancy_id_fkey
    FOREIGN KEY (vacancy_id) REFERENCES public.vacancies(id) ON DELETE CASCADE;

-- Ensure interviews.candidate_id cascades (already done in earlier migration but ensure it)
ALTER TABLE public.interviews
  DROP CONSTRAINT IF EXISTS interviews_candidate_id_fkey,
  ADD CONSTRAINT interviews_candidate_id_fkey
    FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;

-- scorecards cascade from interviews (should already exist)
ALTER TABLE public.scorecards
  DROP CONSTRAINT IF EXISTS scorecards_interview_id_fkey,
  ADD CONSTRAINT scorecards_interview_id_fkey
    FOREIGN KEY (interview_id) REFERENCES public.interviews(id) ON DELETE CASCADE;

-- candidates.client_id stays SET NULL (candidates are not owned by a client)
ALTER TABLE public.candidates
  DROP CONSTRAINT IF EXISTS candidates_client_id_fkey,
  ADD CONSTRAINT candidates_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
