import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import CollegeSelection from '../components/CollegeSelection';

export default function CollegeSelectionPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Check for success message from quiz completion
    const message = router.query.message as string;
    if (message) {
      setSuccessMessage(message);
      // Clear the query parameter
      router.replace("/college-selection", undefined, { shallow: true });
    }
  }, [mounted, router.query.message]);

  if (!mounted) {
    // Prevents hydration mismatch by not rendering until client-side
    return null;
  }

  return <CollegeSelection successMessage={successMessage} />;
} 