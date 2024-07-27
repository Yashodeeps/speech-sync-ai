import axios from "axios";

export const ExpressionsJob = async ({ job_id }: { job_id: string }) => {
  console.log("job_id", job_id);

  const pollInterval = 1000; // 1 second
  const maxAttempts = 20; // Prevent infinite polling, adjust as needed

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await axios.get(
        `https://api.hume.ai/v0/batch/jobs/${job_id}`,
        {
          headers: {
            "X-Hume-Api-Key": `${process.env.NEXT_PUBLIC_HUME_API_KEY}`,
          },
        }
      );

      console.log("Job status:", response.data);

      if (response.data.state.status !== "IN_PROGRESS") {
        console.log("Job completed:", response.data);
        const expressionData = await axios.get(
          `https://api.hume.ai/v0/batch/jobs/${job_id}/predictions`,
          {
            headers: {
              "X-Hume-Api-Key": `${process.env.NEXT_PUBLIC_HUME_API_KEY}`,
            },
          }
        );
        console.log("expressionData", expressionData.data);
        return expressionData.data;
      }

      // Wait for the polling interval before the next attempt
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error("Error polling job status:", error);
      throw error; // or handle the error as appropriate for your application
    }
  }

  throw new Error("Job processing timed out");
};
