from aim import Repo

from tests.perf_tests.base import StorageTestBase
from tests.perf_tests.utils import get_baseline, write_baseline
from tests.perf_tests.storage.utils import iterative_access_metric_values


class TestIterativeAccessExecutionTime(StorageTestBase):
    def test_iterative_access(self):
        test_name = 'test_iterative_access'
        repo = Repo.default_repo()
        query = 'metric.name == "metric 0"'
        execution_time = iterative_access_metric_values(repo, query)
        baseline = get_baseline(test_name)
        if baseline:
            self.assertInRange(execution_time, baseline)
        else:
            write_baseline(test_name, execution_time)
