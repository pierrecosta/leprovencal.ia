from types import SimpleNamespace
import sys

from app.utils.db_errors import format_db_exception
from sqlalchemy.exc import DataError


class StringDataRightTruncation(Exception):
    def __init__(self, msg, column_name=None):
        self._msg = msg
        self.diag = SimpleNamespace(column_name=column_name)

    def __str__(self):
        return self._msg


class UniqueViolation(Exception):
    def __init__(self, msg, constraint_name=None):
        self._msg = msg
        self.diag = SimpleNamespace(constraint_name=constraint_name)

    def __str__(self):
        return self._msg


class FakeSAExc(Exception):
    def __init__(self, orig):
        self.orig = orig


def run_tests():
    # 1) StringDataRightTruncation with column
    orig = StringDataRightTruncation('value too long for type character varying(30)', column_name='titre')
    exc = FakeSAExc(orig)
    msg, field, err_type = format_db_exception(exc)
    assert 'trop longue' in msg.lower() or 'trop' in msg.lower(), f'unexpected msg: {msg}'
    assert field == 'titre'

    # 2) Unique violation
    orig2 = UniqueViolation('duplicate key value violates unique constraint', constraint_name='uniq_title')
    exc2 = FakeSAExc(orig2)
    msg2, field2, err2_type = format_db_exception(exc2)
    assert 'déjà' in msg2 or 'deja' in msg2 or 'utilis' in msg2
    assert field2 == 'uniq_title'

    # 3) Generic SQLAlchemy DataError
    data_err = DataError('generic data error')
    msg3, field3, err3_type = format_db_exception(data_err)
    assert 'erreur' in msg3.lower()

    print('All db_errors tests passed')


if __name__ == '__main__':
    try:
        run_tests()
    except AssertionError as e:
        print('TEST FAILED:', e)
        sys.exit(1)
    except Exception as e:
        print('ERROR DURING TEST:', e)
        sys.exit(2)
    sys.exit(0)
