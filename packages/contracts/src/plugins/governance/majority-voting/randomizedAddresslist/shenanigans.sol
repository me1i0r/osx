    function calculateSampleSize(uint256 _members) external  {
        uint256 zValue = 196; // for 95% confidence interval (z-score of 1.96 * 100)
        uint256 marginOfError = 5; // 5% margin of error
        uint256 populationSize = _members;
        uint256 p = 50; // probability of success in the population (50% for a binary choice)
        uint256 q = 100 - p; // probability of failure in the population
        uint256 S = (zValue * zValue * p * q) / (marginOfError * marginOfError * 10000);
        uint256 m = 10000;
        sampleSize = (S * m) / (m + ((S - 1) * m) / populationSize);
    }