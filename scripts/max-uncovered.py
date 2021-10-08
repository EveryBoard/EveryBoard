#!/usr/bin/python
from lxml import html

f = open('coverage/index.html',mode='r')
page = f.read()
f.close()
tree = html.fromstring(page)

def to_missing(x):
    "Converts from the string AA/BB to the number BB-AA"
    [low, high] = x.split('/')
    return int(high)-int(low)

dirs = tree.xpath('//td/a/text()')
statements = map(to_missing, tree.xpath('//tr/td[4]/text()'))
branches = map(to_missing, tree.xpath('//tr/td[6]/text()'))

print('Missing branches:')
total_branches = 0
for (d, b) in sorted(zip(dirs, branches), key=lambda x: -x[1]):
    if b > 0:
        print('%s: %d' % (d, b))
        total_branches += b

print('Total: %d' % total_branches)

print('')
print('Missing statements:')
total_statements = 0
for (d, s) in sorted(zip(dirs, statements), key=lambda x: -x[1]):
    if s > 0:
        print('%s: %d' % (d, s))
        total_statements += s
print('Total: %d' % total_statements)
