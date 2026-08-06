import { useEffect, useState, useRef } from "react";
import "../styles/ExecuteBar.css";

function ExecuteBar({ plan, executing, onExecute }) {
    const steps = plan?.steps || [];
    const totalSteps = steps.length || 1;

    const [currentStep, setCurrentStep] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (executing) {
            setCurrentStep(1);
            let step = 1;

            // Total steps ke hisaab se pacing — jyada steps to thoda fast, kam steps to thoda slow
            const tickInterval = Math.max(250, Math.min(700, 2000 / totalSteps));

            intervalRef.current = setInterval(() => {
                step += 1;
                if (step >= totalSteps) {
                    step = totalSteps;
                    clearInterval(intervalRef.current);
                }
                setCurrentStep(step);
            }, tickInterval);
        } else {
            clearInterval(intervalRef.current);
            if (currentStep > 0) {
                // Execution complete hone pe progress ko 100% dikhao, phir chhupa do
                setCurrentStep(totalSteps);
                const hideTimer = setTimeout(() => setCurrentStep(0), 1200);
                return () => clearTimeout(hideTimer);
            }
        }

        return () => clearInterval(intervalRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [executing]);

    if (!plan) return null;

    const progressPercent = Math.min(100, (currentStep / totalSteps) * 100);

    return (
        <div className="execute-bar">
            {executing && (
                <div className="execute-progress">
                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className="progress-label">
                        {currentStep >= totalSteps
                            ? `Finishing up...`
                            : `Executing step ${currentStep} of ${totalSteps}...`}
                    </span>
                </div>
            )}

            <button
                className="execute-btn"
                onClick={onExecute}
                disabled={executing}
            >
                {executing ? "Executing..." : `Execute`}
            </button>
        </div>
    );
}

export default ExecuteBar;