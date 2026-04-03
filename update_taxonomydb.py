#!/usr/bin/env python3

'''
pip install bio
pip install ete3
'''

from ete3 import NCBITaxa
def update_ete3_taxonomydb():
    custom_path = "/home/w3const/work-kosuge/etetoolkit/ncbitaxonomy.sqlite"
    ncbi = NCBITaxa(dbfile=custom_path)
    ncbi.update_taxonomy_database()

if __name__ == "__main__":
    update_ete3_taxonomydb()
