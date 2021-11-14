#!/usr/bin/python
import sys
from lxml import html
import pandas

if len(sys.argv) < 2:
    print('Usage: %s [generate|check]' % sys.argv[0])
    exit(1)


def to_missing(x):
    "Converts from the string AA/BB to the number BB-AA"
    [low, high] = x.split('/')
    return int(high)-int(low)


def load_coverage_data_from_html_tree(tree, dirs, td):
    data = map(to_missing, tree.xpath('//tr/td[%d]/text()' % td))
    return dict(sorted(zip(dirs, data), key=lambda x: -x[1]))

def load_coverage_data():
    f = open('coverage/index.html', mode='r')
    page = f.read()
    f.close()
    tree = html.fromstring(page)

    dirs = tree.xpath('//td/a/text()')
    return {
        'statements': load_coverage_data_from_html_tree(tree, dirs, 4),
        'branches': load_coverage_data_from_html_tree(tree, dirs, 6),
        'functions': load_coverage_data_from_html_tree(tree, dirs, 8),
        'lines': load_coverage_data_from_html_tree(tree, dirs, 10)
    }

def load_stored_coverage_from(path):
    data = pandas.read_csv(path, header=None)
    dirs = data[0]
    values = data[1]
    return dict(sorted(zip(dirs, values), key=lambda x: -x[1]))

def load_stored_coverage():
    return {
        'statements': load_stored_coverage_from('coverage/statements.csv'),
        'branches': load_stored_coverage_from('coverage/branches.csv'),
        'functions': load_stored_coverage_from('coverage/functions.csv'),
        'lines': load_stored_coverage_from('coverage/lines.csv')
    }

def generate_in_file(data, path):
    f = open(path, mode='w')
    for directory in data:
        f.write('%s,%d\n' % (directory, data[directory]))
    f.close()

def generate():
    data = load_coverage_data()
    generate_in_file(data['statements'], 'coverage/statements.csv')
    generate_in_file(data['branches'], 'coverage/branches.csv')
    generate_in_file(data['functions'], 'coverage/functions.csv')
    generate_in_file(data['lines'], 'coverage/lines.csv')
    print('CSV files generated with success')

def check():
    old = load_stored_coverage()
    new = load_coverage_data()

    decreased = False
    for type_ in ['statements', 'branches', 'functions', 'lines']:
        for directory in set.union(set(old[type_]), set(new[type_])):
            if directory in old[type_] and directory in new[type_]:
                new_missing = new[type_][directory]
                old_missing = old[type_][directory]
                if new_missing > old_missing:
                    decreased = True
                    print('ERROR: increased missing %s in coverage of %s, from %d to %d' % (type_, directory, old_missing, new_missing))
                elif new_missing < old_missing:
                    print('GOOD: decreased missing %s in coverage of %s, from %d to %d' % (type_, directory, old_missing, new_missing))
            elif not (directory in new[type_]):
                # directory was removed, everything is fine
                continue
            elif not (directory in old[type_]):
                # new directory, we require 100% coverage
                new_missing = new[type_][directory]
                if new_missing > 0:
                    decreased = True
                    print('ERROR: increased missing %s in coverage of %s due to a new directory with missing coverage of %d %s' % (type_, directory, new_missing, type_))
    if decreased:
        exit(1) # fail for CI script

if sys.argv[1] == 'check':
    check()
elif sys.argv[1] == 'generate':
    generate()
else:
    print('Usage: %s [generate|check]' % sys.argv[0])
    exit(1)
