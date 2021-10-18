#!/usr/bin/python
import sys
from lxml import html
import pandas as pd

if len(sys.argv) < 2:
    print('Usage: %s [generate|check]' % sys.argv[0])
    exit(1)


def to_missing(x):
    "Converts from the string AA/BB to the number BB-AA"
    [low, high] = x.split('/')
    return int(high)-int(low)


def load_coverage_data():
    f = open('coverage/index.html', mode='r')
    page = f.read()
    f.close()
    tree = html.fromstring(page)

    dirs = tree.xpath('//td/a/text()')
    statements = map(to_missing, tree.xpath('//tr/td[4]/text()'))
    branches = map(to_missing, tree.xpath('//tr/td[6]/text()'))
    functions = map(to_missing, tree.xpath('//tr/td[8]/text()'))

    return {
        'branches': dict(sorted(zip(dirs, branches), key=lambda x: -x[1])),
        'statements': dict(sorted(zip(dirs, statements), key=lambda x: -x[1])),
        'functions': dict(sorted(zip(dirs, functions), key=lambda x: -x[1]))
    }

def load_stored_coverage_from(path):
    data = pd.read_csv(path, header=None)
    dirs = data[0]
    values = data[1]
    return dict(sorted(zip(dirs, values), key=lambda x: -x[1]))

def load_stored_coverage():
    return {
        'statements': load_stored_coverage_from('coverage/statements.csv'),
        'branches': load_stored_coverage_from('coverage/branches.csv'),
        'functions': load_stored_coverage_from('coverage/functions.csv')
    }

def generate_in_file(data, path):
    f = open(path, mode='w')
    for (directory, missing) in data:
        f.write('%s,%d\n' % (directory, missing))
    f.close()

def generate():
    data = load_coverage_data()
    generate_in_file(data['statements'], 'coverage/statements.csv')
    generate_in_file(data['branches'], 'coverage/branches.csv')
    generate_in_file(data['functions'], 'coverage/functions.csv')
    print('CSV files generated with success')

def check():
    old = load_stored_coverage()
    new = load_coverage_data()

    decreased = False
    for type_ in ['statements', 'branches', 'functions']:
        for directory in old[type_]:
            new_missing = new[type_][directory]
            old_missing = old[type_][directory]
            if new_missing > old_missing:
                decreased = True
                print('ERROR: decreased %s coverage in %s, from %d to %d' % (type_, directory, old_missing, new_missing))
            elif new_missing < old_missing:
                print('GOOD: increased %s coverage in %s, from %d to %d' % (type_, directory, old_missing, new_missing))
    if decreased:
        exit(1) # fail for CI script

if sys.argv[1] == 'check':
    check()
elif sys.argv[1] == 'generate':
    generate()
else:
    print('Usage: %s [generate|check]' % sys.argv[0])
    exit(1)
